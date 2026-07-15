"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DomainDetailHeader } from "./DomainDetailHeader";
import { DomainStatusBanner } from "./DomainStatusBanner";
import { VulnerabilityBreakdown } from "./VulnerabilityBreakdown";
import { SslStatusCard } from "./SslStatusCard";
import { RecentActivity } from "./RecentActivity";
import { MonitoringSettings } from "./MonitoringSettings";
import { RunScanModal } from "./RunScanModal";
import { TokenExpiryBanner } from "./TokenExpiryBanner";
import { RecentAlertsCard } from "./RecentAlertsCard";
import { SecurityScoreCard } from "@/features/dashboard/components/scan/findings/SecurityScoreCard";
import { scanService } from "@/features/scans/services/scan.service";
import { privateApi } from "@/lib/axios";
import { toast } from "sonner";
import type {
  UpdateMonitoringSettingsPayload,
  ToggleMonitoringResponse,
  UpdateMonitoringSettingsResponse,
} from "@/features/monitoring/types/monitoring.types";
import type {
  DomainDetailData,
  ScanType,
  MonitoringSettings as MonitoringSettingsType,
} from "./domain-detail.types";

interface DomainDetailPageProps {
  data: DomainDetailData;
  /** The domain UUID — used to redirect to scan progress after initiating a scan */
  domainId: string;
}

export function DomainDetailPage({ data, domainId }: DomainDetailPageProps) {
  const router = useRouter();
  const [showScanModal, setShowScanModal] = useState(false);
  const [monitoringActive, setMonitoringActive] = useState(data.monitoringActive);
  const [isLaunching, setIsLaunching] = useState(false);
  const [tokenBannerDismissed, setTokenBannerDismissed] = useState(false);

  const handleMonitoringChange = async (active: boolean) => {
    try {
      // Optimistic update
      setMonitoringActive(active);
      const res = await privateApi.patch<ToggleMonitoringResponse>(
        `/api/monitoring/domains/${domainId}/settings/toggle?enable=${active}`
      );
      if (!res.data.isSuccess) {
        throw new Error(res.data.error?.message ?? "Failed to toggle monitoring.");
      }
      toast.success(`Monitoring ${active ? "enabled" : "paused"}.`);
    } catch (err: unknown) {
      // Revert on error
      setMonitoringActive(!active);
      toast.error(err instanceof Error ? err.message : "Failed to toggle monitoring.");
    }
  };

  const handleScanStart = async (scanType: ScanType) => {
    setShowScanModal(false);
    setIsLaunching(true);
    try {
      const res = await scanService.createScan({
        domainId: domainId,
        scanType: scanType === "deep" ? "FULL_SCAN" : "QUICK_SCAN",
      });

      if (res.isSuccess && res.value) {
        const { scanId, initiatedAt } = res.value;
        const at = initiatedAt ?? new Date().toISOString();

        if (
          res.value.message === "A scan is already in progress for this domain." ||
          res.value.message === "Scan already initiated."
        ) {
          toast.info(res.value.message);
        }

        router.push(
          `/scan/progress?scanId=${encodeURIComponent(scanId)}&domain=${encodeURIComponent(data.domainName)}&initiatedAt=${encodeURIComponent(at)}`,
        );
      } else {
        toast.error(res.error?.message ?? "Failed to start scan.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      toast.error(msg);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleSaveSettings = async (settings: MonitoringSettingsType) => {
    try {
      const payload: UpdateMonitoringSettingsPayload = {
        monitoringEnabled: monitoringActive,
        scanFrequency: settings.scanFrequency,
        sslAlertThresholds: settings.sslAlertThresholds.map((t) => parseInt(t, 10)).filter(n => !isNaN(n)),
        notificationChannels: [
          ...(settings.emailAlerts ? ["Email" as const] : []),
          ...(settings.slackAlerts ? ["Slack" as const] : []),
        ],
      };

      const res = await privateApi.put<UpdateMonitoringSettingsResponse>(
        `/api/monitoring/domains/${domainId}/settings`,
        payload
      );

      if (!res.data.isSuccess) {
        throw new Error(res.data.error?.message ?? "Failed to save settings.");
      }
      toast.success("Settings saved successfully.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings.");
    }
  };

  return (
    <div className="p-5 md:p-8 space-y-6 min-h-full bg-brand-bg">
      {showScanModal && (
        <RunScanModal
          domainName={data.domainName}
          onClose={() => setShowScanModal(false)}
          onStart={(type) => void handleScanStart(type)}
        />
      )}

      <DomainDetailHeader
        domainName={data.domainName}
        domainStatus={data.domainStatus}
        monitoringActive={monitoringActive}
        onMonitoringChange={handleMonitoringChange}
        onRunScan={() => setShowScanModal(true)}
        isLaunching={isLaunching}
      />

      {/* Feature A: Token Expiry Warning */}
      {data.tokenExpiringSoon && !tokenBannerDismissed && (
        <TokenExpiryBanner onDismiss={() => setTokenBannerDismissed(true)} />
      )}

      <DomainStatusBanner
        isLive={monitoringActive}
        nextScanIn={data.nextScanIn}
        lastMonitoredAt={data.lastMonitoredAt}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <SecurityScoreCard
          score={data.securityScore}
          label={`Risk Level: ${
            data.riskLevel === "unknown"
              ? "Unknown"
              : data.riskLevel.charAt(0).toUpperCase() + data.riskLevel.slice(1)
          }`}
        />
        <VulnerabilityBreakdown {...data.vulnerabilityBreakdown} />
        <SslStatusCard
          isValid={data.ssl.isValid}
          expiresInDays={data.ssl.expiresInDays}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RecentActivity events={data.recentActivity} />
        <MonitoringSettings
          initialSettings={data.monitoringSettings}
          onSave={handleSaveSettings}
        />
      </div>

      {/* Feature B: Recent Security Alerts */}
      <RecentAlertsCard alerts={data.recentAlerts} />
    </div>
  );
}
