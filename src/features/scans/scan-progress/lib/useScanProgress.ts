import { useEffect, useState, useRef, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { getUserIdFromToken } from "@/lib/jwt";
import { scanService, ScanReport } from "../../services/scan.service";

export interface ScanResult {
  scanId: string;
  domainId: string;
  duration: string;
  passedCount: number;
  failedCount: number;
  securityScore: number;
}

export type ScanStatus = "running" | "completed" | "failed";

export function useScanProgress(scanId?: string, initiatedAtParam?: string) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<ScanStatus>("running");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  
  const [stepStatuses, setStepStatuses] = useState<("completed" | "current" | "pending")[]>([
    "current",
    "pending",
    "pending",
    "pending",
    "pending",
  ]);

  const hubConnectionRef = useRef<signalR.HubConnection | null>(null);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);
  const pollerIdRef = useRef<NodeJS.Timeout | null>(null);

  // Simulation State Refs
  const simStateRef = useRef({
    startTime: 0,
    fastForwarding: false,
    isFinished: false,
    stepDurations: [] as number[],
    stepStarts: [] as number[],
    totalDuration: 0,
  });

  // Calculate duration string
  const calculateDuration = (startIso: string, endIso: string): string => {
    try {
      const start = new Date(startIso).getTime();
      const end = new Date(endIso).getTime();
      if (!Number.isFinite(start) || !Number.isFinite(end)) return "0s";
      const diffMs = Math.max(0, end - start);
      const totalSeconds = Math.floor(diffMs / 1000);
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    } catch {
      return "0s";
    }
  };

  // Compile stats
  const compileScanResult = useCallback((report: ScanReport): ScanResult => {
    const scores = report.subScores || {};
    let passedCount = 0;
    
    if (report.findingGroups && typeof report.findingGroups.passCount === 'number') {
      passedCount = report.findingGroups.passCount;
    } else {
      if ((scores.exposure?.score ?? 0) >= 80) passedCount++;
      if ((scores.ssl?.score ?? 0) >= 80) passedCount++;
      if ((scores.dns?.score ?? 0) >= 80) passedCount++;
    }
    
    const isValidDate = (d: string | undefined | null) => d && !isNaN(Date.parse(d));
    const startIso = isValidDate(initiatedAtParam) ? initiatedAtParam! : (isValidDate(report.initiatedAt) ? report.initiatedAt! : "");

    return {
      scanId: report.scanId,
      domainId: report.domainId,
      duration: calculateDuration(startIso, new Date().toISOString()),
      passedCount: passedCount,
      failedCount: 3 - passedCount,
      securityScore: report.securityScore,
    };
  }, [initiatedAtParam]);

  // Build cumulative step starts
  const buildStepStarts = (durations: number[], startOffsetMs = 0) => {
    const starts = [startOffsetMs];
    for (let i = 0; i < durations.length - 1; i++) {
      starts.push(starts[i] + durations[i]);
    }
    return starts;
  };

  const getInterpolatedProgress = (elapsed: number) => {
    const { stepStarts, stepDurations } = simStateRef.current;
    
    let currentStep = 4;
    for (let i = 0; i < 5; i++) {
      if (elapsed < stepStarts[i] + stepDurations[i]) {
        currentStep = i;
        break;
      }
    }

    const stepStart = stepStarts[currentStep];
    const stepDuration = stepDurations[currentStep];
    
    const stepElapsed = Math.max(0, elapsed - stepStart);
    const stepProgressFraction = Math.min(1, stepElapsed / stepDuration);
    
    const baseProgress = currentStep * 20;
    const computedProgress = baseProgress + (stepProgressFraction * 20);
    
    return {
      progress: Math.min(100, computedProgress),
      stepIdx: currentStep
    };
  };

  const triggerFastForward = useCallback((report: ScanReport) => {
    const state = simStateRef.current;
    if (state.fastForwarding || state.isFinished) return;
    
    state.fastForwarding = true;
    
    const elapsed = Date.now() - state.startTime;
    const currentProgressInfo = getInterpolatedProgress(elapsed);
    const stepIdx = currentProgressInfo.stepIdx;
    const currentProgress = currentProgressInfo.progress;
    
    // If we're already at step 4 and past 99%, just complete
    if (stepIdx === 4 && currentProgress >= 99) {
      state.isFinished = true;
      setProgress(100);
      setStepStatuses(["completed", "completed", "completed", "completed", "completed"]);
      setScanResult(compileScanResult(report));
      setStatus("completed");
      return;
    }

    // Rewrite remaining durations to random 3-8s
    for (let i = stepIdx; i < 5; i++) {
      state.stepDurations[i] = Math.floor(Math.random() * 5000) + 3000;
    }
    
    // Adjust earlier durations so the current elapsed time aligns exactly with the current progress
    let priorDurationSum = 0;
    for (let i = 0; i < stepIdx; i++) {
      priorDurationSum += state.stepDurations[i];
    }
    
    // Calculate how far into the current step we should be based on the new duration
    const fraction = Math.max(0, (currentProgress - stepIdx * 20) / 20);
    const expectedStepElapsed = state.stepDurations[stepIdx] * fraction;
    
    const expectedElapsed = priorDurationSum + expectedStepElapsed;
    const shiftMs = expectedElapsed - elapsed;
    state.startTime -= shiftMs; // Shift absolute time

    state.stepStarts = buildStepStarts(state.stepDurations);
    state.totalDuration = state.stepStarts[4] + state.stepDurations[4];

    setScanResult(compileScanResult(report));
  }, [compileScanResult]);

  const handleFailure = useCallback(() => {
    simStateRef.current.isFinished = true;
    setStatus("failed");
    setStepStatuses((prev) => prev.map((s) => (s === "current" ? "pending" : s)));
    if (timerIdRef.current) clearInterval(timerIdRef.current);
    if (pollerIdRef.current) clearInterval(pollerIdRef.current);
  }, []);

  useEffect(() => {
    if (!scanId) return;
    let isMounted = true;

    // Initialize Simulation Logic
    const initSimulation = () => {
      setProgress(0);
      setStatus("running");
      setScanResult(null);
      setStepStatuses(["current", "pending", "pending", "pending", "pending"]);

      let absoluteStart = initiatedAtParam ? new Date(initiatedAtParam).getTime() : Date.now();
      if (!Number.isFinite(absoluteStart)) absoluteStart = Date.now();
      
      const MIN_MS = 240_000;
      const MAX_MS = 420_000;
      const totalDuration = Math.floor(Math.random() * (MAX_MS - MIN_MS + 1)) + MIN_MS;
      
      const stepDurations = Array(5).fill(40_000);
      let extra = totalDuration - 200_000;
      for (let i = 0; i < 4; i++) {
        const add = Math.random() * extra;
        stepDurations[i] += add;
        extra -= add;
      }
      stepDurations[4] += extra;

      simStateRef.current = {
        startTime: absoluteStart,
        fastForwarding: false,
        isFinished: false,
        stepDurations,
        stepStarts: buildStepStarts(stepDurations),
        totalDuration,
      };

      // Progress Loop
      timerIdRef.current = setInterval(() => {
        if (!isMounted) return;
        const state = simStateRef.current;
        if (state.isFinished) return;

        const elapsed = Date.now() - state.startTime;
        const { progress: nextProg, stepIdx } = getInterpolatedProgress(elapsed);

        const cappedProg = (!state.fastForwarding && nextProg > 95) ? 95 : nextProg;

        setProgress(cappedProg);
        
        setStepStatuses((prev) => {
          const next = [...prev];
          for (let i = 0; i < 5; i++) {
            if (i < stepIdx) next[i] = "completed";
            else if (i === stepIdx) next[i] = "current";
            else next[i] = "pending";
          }
          return next;
        });

        if (state.fastForwarding && cappedProg >= 100) {
          state.isFinished = true;
          if (timerIdRef.current) clearInterval(timerIdRef.current);
          setStepStatuses(["completed", "completed", "completed", "completed", "completed"]);
          setStatus("completed");
        }
      }, 200);
    };

    // REST Poller (Fallback)
    const checkStatus = async () => {
      try {
        const res = await scanService.getScanReport(scanId);
        if (isMounted && res.isSuccess && res.value) {
          if (res.value.status === "Completed") {
            triggerFastForward(res.value);
            if (pollerIdRef.current) clearInterval(pollerIdRef.current);
            return true;
          } else if (res.value.status === "Failed") {
            handleFailure();
            if (pollerIdRef.current) clearInterval(pollerIdRef.current);
            return true;
          }
        }
      } catch (err) {
        console.warn("Poll check failed", err);
      }
      return false;
    };

    const initConnection = async () => {
      // Start Simulation
      initSimulation();
      
      // Initial API check for quick resolution
      const isTerminal = await checkStatus();
      if (isTerminal) return;

      // Start 30s Poller (Safety Net)
      pollerIdRef.current = setInterval(checkStatus, 30_000);

      // SignalR setup
      const userId = getUserIdFromToken();
      if (!userId) return;

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${apiBaseUrl}/hubs/scans`, { skipNegotiation: true, transport: signalR.HttpTransportType.WebSockets })
        .withAutomaticReconnect()
        .build();

      hubConnectionRef.current = connection;

      connection.on("ScanCompleted", async (event: { scanId: string }) => {
        if (event?.scanId === scanId) {
          checkStatus(); // Fetch full report and fast-forward
        }
      });

      connection.on("ScanFailed", (event: { scanId: string }) => {
        if (event?.scanId === scanId) handleFailure();
      });

      try {
        await connection.start();
        await connection.invoke("JoinUserGroup", userId);
      } catch (err) {
        console.warn("SignalR failed, relying on poller...", err);
      }
    };

    initConnection();

    return () => {
      isMounted = false;
      if (timerIdRef.current) clearInterval(timerIdRef.current);
      if (pollerIdRef.current) clearInterval(pollerIdRef.current);
      if (hubConnectionRef.current) {
        hubConnectionRef.current.stop().catch(() => {});
      }
    };
  }, [scanId, initiatedAtParam, triggerFastForward, handleFailure]);

  return {
    progress,
    stepStatuses,
    scanResult,
    isCompleted: status === "completed",
    isFailed: status === "failed",
  };
}
