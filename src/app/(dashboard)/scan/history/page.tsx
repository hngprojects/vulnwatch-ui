"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  CircleGauge,
  Globe2,
  RotateCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldEllipsis,
  Loader2,
  Play,
  History,
} from "lucide-react";
import { scanService, ScanHistoryItem } from "@/features/scans/services/scan.service";
import { toast } from "sonner";

type RiskLevel = "Low" | "High" | "Critical";

const riskDotClassName: Record<RiskLevel, string> = {
  Low: "bg-brand-risk-low",
  High: "bg-brand-risk-high",
  Critical: "bg-brand-risk-critical",
};

function ScanTypeIcon({ scanType }: { scanType: string }) {
  const Icon = scanType.toLowerCase().includes("quick") ? RotateCw : Shield;
  return <Icon className="h-4 w-4 shrink-0 text-gray-700" strokeWidth={1.8} />;
}

function RiskIndicator({ level }: { level: string | null }) {
  let mappedLevel: RiskLevel = "Low";
  let statusText = "Good";

  if (level) {
    const norm = level.toLowerCase();
    if (norm === "critical") {
      mappedLevel = "Critical";
      statusText = "Immediate Action Required";
    } else if (norm === "high") {
      mappedLevel = "High";
      statusText = "Action Needed";
    } else if (norm === "medium" || norm === "moderate") {
      mappedLevel = "High"; // map medium to orange High indicator styling
      statusText = "Action Recommended";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span
          className={cn("h-2 w-2 rounded-full", riskDotClassName[mappedLevel] || "bg-brand-risk-low")}
          aria-hidden="true"
        />
        <span className="text-sm font-medium text-brand-dark capitalize">
          {level || "Low"}
        </span>
      </div>
      <p className="text-sm text-brand-gray">{statusText}</p>
    </div>
  );
}

function parseDateTime(dateStr: string) {
  if (!dateStr) return { date: "—", time: "—" };
  try {
    const d = new Date(dateStr);
    const date = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    return { date, time };
  } catch {
    return { date: "—", time: "—" };
  }
}

function SummaryCards({ history }: { history: ScanHistoryItem[] }) {
  const totalScans = history.length;
  const highRisk = history.filter(
    (h) => h.riskLevel?.toLowerCase() === "critical" || h.riskLevel?.toLowerCase() === "high"
  ).length;
  const medRisk = history.filter(
    (h) => h.riskLevel?.toLowerCase() === "medium" || h.riskLevel?.toLowerCase() === "moderate"
  ).length;
  const lowRisk = history.filter(
    (h) => !h.riskLevel || h.riskLevel.toLowerCase() === "low"
  ).length;

  const summaryCards = [
    {
      label: "Total Scans",
      value: totalScans,
      icon: CircleGauge,
      iconClassName: "text-brand-info",
      iconWrapClassName: "bg-brand-info-bg",
    },
    {
      label: "High Risk Found",
      value: highRisk,
      icon: ShieldAlert,
      iconClassName: "text-brand-risk-critical",
      iconWrapClassName: "bg-brand-risk-critical-bg",
    },
    {
      label: "Medium Risk Found",
      value: medRisk,
      icon: ShieldEllipsis,
      iconClassName: "text-brand-risk-high",
      iconWrapClassName: "bg-brand-risk-high-bg",
    },
    {
      label: "Low Risk Found",
      value: lowRisk,
      icon: ShieldCheck,
      iconClassName: "text-brand-risk-low",
      iconWrapClassName: "bg-brand-risk-low-bg",
    },
  ];

  return (
    <section
      aria-label="Report summary"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-20"
    >
      {summaryCards.map(
        ({ label, value, icon: Icon, iconClassName, iconWrapClassName }) => (
          <article
            key={label}
            className="flex min-h-14 items-center justify-between rounded-md border border-brand-border-light bg-white px-3 py-2 shadow-[0_1px_4px_rgba(17,24,39,0.03)]"
          >
            <div>
              <p className="text-sm leading-5 text-brand-gray">{label}</p>
              <p className="text-base leading-5 font-semibold text-brand-dark">
                {value}
              </p>
            </div>
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full",
                iconWrapClassName,
              )}
              aria-hidden="true"
            >
              <Icon className={cn("h-4 w-4", iconClassName)} strokeWidth={1.8} />
            </span>
          </article>
        ),
      )}
    </section>
  );
}

function ScanHistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const domainId = searchParams.get("domainId");
  const domainName = searchParams.get("domainName") || "your domain";

  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingScan, setStartingScan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!domainId) {
      Promise.resolve().then(() => {
        setError("No Domain ID provided.");
        setLoading(false);
      });
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await scanService.getScanHistory(domainId);
        if (res.isSuccess && res.value) {
          setHistory(res.value.data || []);
        } else {
          setError(res.error?.message || "Failed to retrieve scan history.");
        }
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
        const backendMessage = axiosError.response?.data?.error?.message;
        setError(backendMessage || (err instanceof Error ? err.message : "An unexpected error occurred."));
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [domainId]);

  const handleStartScan = async () => {
    if (!domainName || !domainId) return;
    setStartingScan(true);
    const toastId = toast.loading("Initiating safe non-intrusive scan...", {
      description: `Target: ${domainName}`,
    });
    try {
      const response = await scanService.createScan({
        domainId: domainId,
        scanType: "QUICK_SCAN",
      });

      if (response.isSuccess && response.value) {
        if (
          response.value.message === "A scan is already in progress for this domain." ||
          response.value.message === "Scan already initiated."
        ) {
          toast.info(response.value.message, { id: toastId });
        } else {
          toast.success("Scan initiated successfully!", { id: toastId });
        }

        const { scanId, initiatedAt } = response.value;
        const activeInitiatedAt = initiatedAt || new Date().toISOString();

        router.push(
          `/scan/progress?scanId=${encodeURIComponent(scanId)}&domain=${encodeURIComponent(domainName)}&initiatedAt=${encodeURIComponent(activeInitiatedAt)}`
        );
      } else {
        toast.error(response.error?.message || "Failed to start scan. Please try again.", { id: toastId });
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      const backendMessage = axiosError.response?.data?.error?.message;
      const errMsg = backendMessage || (err instanceof Error ? err.message : "Failed to start scan.");
      toast.error(errMsg, { id: toastId });
    } finally {
      setStartingScan(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3 p-5">
        <Loader2 className="h-8 w-8 animate-spin text-[#072e28]" />
        <p className="text-neutral-500 font-medium text-sm">Retrieving scan history...</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-8 font-geist max-w-6xl mx-auto space-y-8">
      {/* Header and Domain side-by-side */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-brand-border-light">
        {/* Left Side: Navigation & Header */}
        <div className="space-y-3 flex-1">
          <Link
            href="/scan"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#072e28] hover:text-[#0b473e] hover:underline"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} /> Back to Scan Setup
          </Link>
          <header>
            <h1 className="text-xl font-bold leading-7 text-brand-dark">Scan History</h1>
            <p className="mt-1 text-sm text-brand-gray">
              View and track all security scan timelines
            </p>
          </header>
        </div>

        {/* Right Side: Domain Info */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-end">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-medium-gray text-brand-dark"
            aria-hidden="true"
          >
            <Globe2 className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-xs font-semibold text-brand-text-light uppercase tracking-wider">Domain</h2>
            <p className="text-base md:text-lg font-bold text-brand-dark leading-tight">{domainName}</p>
          </div>
        </div>
      </div>

      {/* Main Timeline Card or Empty State */}
      {error || history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 bg-white border border-brand-border-light rounded-md text-center shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-brand-light-gray flex items-center justify-center mb-6">
              <History size={28} className="text-brand-slate" />
            </div>
            <h2 className="text-xl font-bold text-brand-dark mb-2">
              No Scan History Found
            </h2>
            <p className="text-sm text-brand-gray leading-relaxed max-w-md mb-8">
              {error || `We couldn't find any historical records of security scans for ${domainName}. Click the button below to launch your first safe, non-intrusive perimeter audit.`}
            </p>
            <Button
              onClick={handleStartScan}
              disabled={startingScan}
              className="bg-[#072e28] hover:bg-[#0b473e] text-white font-semibold h-12 px-8 rounded-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {startingScan ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Initiating Scan...
                </>
              ) : (
                <>
                  <Play size={18} fill="currentColor" />
                  Start a scan for this domain
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <SummaryCards history={history} />

            <section aria-label="Scan reports" className="pt-3">
              {/* Desktop Table View */}
              <div className="hidden overflow-hidden rounded-md border border-brand-border-light bg-white lg:block">
                <table className="w-full table-fixed text-left">
                  <thead className="bg-gray-50 text-sm font-semibold text-brand-dark">
                    <tr>
                      <th scope="col" className="w-[33%] px-8 py-5">
                        Scan Date &amp; Time
                      </th>
                      <th scope="col" className="w-[25%] px-8 py-5">
                        Scan Type
                      </th>
                      <th scope="col" className="w-[25%] px-8 py-5">
                        Risk Level
                      </th>
                      <th scope="col" className="w-[17%] px-8 py-5">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border-light">
                    {history.map((run) => {
                      const { date, time } = parseDateTime(run.createdAt);
                      const isCompleted = run.status.toLowerCase() === "completed";
                      return (
                        <tr key={run.scanId} className="align-top">
                          <td className="px-8 py-3.5">
                            <p className="text-sm font-medium text-brand-dark">
                              {date}
                            </p>
                            <p className="mt-4 text-sm font-medium text-brand-muted">{time}</p>
                          </td>
                          <td className="px-8 py-3.5">
                            <div className="flex items-center gap-2 text-sm font-medium text-brand-dark">
                              <ScanTypeIcon scanType={run.coverage || "Quick Scan"} />
                              {run.coverage || "Quick"} Scan
                            </div>
                          </td>
                          <td className="px-8 py-3.5">
                            <RiskIndicator level={run.riskLevel} />
                          </td>
                          <td className="px-8 py-3.5">
                            {isCompleted ? (
                              <Link
                                href={`/scan/report?scanId=${encodeURIComponent(run.scanId)}`}
                                className="inline-flex items-center gap-3 text-sm font-medium text-brand-dark transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                              >
                                View Details
                                <ChevronRight className="h-5 w-5" strokeWidth={1.8} />
                              </Link>
                            ) : (
                              <Link
                                href={`/scan/progress?scanId=${encodeURIComponent(run.scanId)}&domain=${encodeURIComponent(domainName)}&initiatedAt=${encodeURIComponent(run.createdAt)}`}
                                className="inline-flex items-center gap-3 text-sm font-medium text-brand-pending-text transition-colors hover:text-brand-pending-text/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                              >
                                Track Progress
                                <ChevronRight className="h-5 w-5" strokeWidth={1.8} />
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="space-y-3 lg:hidden">
                {history.map((run) => {
                  const { date, time } = parseDateTime(run.createdAt);
                  const isCompleted = run.status.toLowerCase() === "completed";
                  return (
                    <article
                      key={run.scanId}
                      className="rounded-lg border border-brand-border-light bg-white p-4 shadow-[0_1px_4px_rgba(17,24,39,0.03)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-brand-dark">
                            {date}
                          </p>
                          <p className="mt-1 text-sm text-brand-gray">{time}</p>
                        </div>
                        {isCompleted ? (
                          <Link
                            href={`/scan/report?scanId=${encodeURIComponent(run.scanId)}`}
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-brand-border-light text-brand-dark transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <ChevronRight className="h-5 w-5" strokeWidth={1.8} />
                          </Link>
                        ) : (
                          <Link
                            href={`/scan/progress?scanId=${encodeURIComponent(run.scanId)}&domain=${encodeURIComponent(domainName)}&initiatedAt=${encodeURIComponent(run.createdAt)}`}
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-brand-border-light text-brand-pending-text transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <ChevronRight className="h-5 w-5" strokeWidth={1.8} />
                          </Link>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.04em] text-brand-text-light">
                            Scan Type
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-sm font-medium text-brand-dark">
                            <ScanTypeIcon scanType={run.coverage || "Quick Scan"} />
                            {run.coverage || "Quick"} Scan
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.04em] text-brand-text-light">
                            Risk Level
                          </p>
                          <div className="mt-2">
                            <RiskIndicator level={run.riskLevel} />
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
    </div>
  );
}

export default function ScanHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#072e28]" />
        </div>
      }
    >
      <ScanHistoryContent />
    </Suspense>
  );
}
