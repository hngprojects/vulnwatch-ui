"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  GitBranch,
  Lock,
  Globe,
  Calendar,
  PlayCircle,
  AlertTriangle,
  TrendingUp,
  Shield,
  Eye,
  Bell,
  Loader2,
} from "lucide-react";
import { scanService } from "@/features/scans/services/scan.service";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, type TabOption } from "@/components/ui/tabs";
import { VulnerabilityList } from "./VulnerabilityList";
import type { Repository, Vulnerability, TrendDataPoint, SeverityLevel } from "../types/repository.types";

interface Props {
  repository: Repository;
  vulnerabilities: Vulnerability[];
  trendData: TrendDataPoint[];
}

type RepoTab = "vulnerabilities" | "trends" | "monitoring";

const REPO_TABS: readonly TabOption<RepoTab>[] = [
  { id: "vulnerabilities", label: "Vulnerabilities" },
  { id: "trends", label: "Trends" },
  { id: "monitoring", label: "Monitoring" },
] as const;

const SEVERITY_STAT: Array<{
  key: keyof Repository;
  label: string;
  severity: SeverityLevel;
  Icon: React.ElementType;
}> = [
  { key: "criticalFindings", label: "Critical", severity: "Critical", Icon: AlertTriangle },
  { key: "highFindings", label: "High", severity: "High", Icon: Shield },
  { key: "mediumFindings", label: "Medium", severity: "Medium", Icon: AlertTriangle },
  { key: "lowFindings", label: "Low", severity: "Low", Icon: Shield },
];

const SEVERITY_CLASSES: Record<SeverityLevel, { bg: string; text: string; border: string }> = {
  Critical: {
    bg: "bg-brand-risk-critical-bg",
    text: "text-brand-risk-critical",
    border: "border-brand-risk-critical/20",
  },
  High: {
    bg: "bg-brand-risk-high-bg",
    text: "text-brand-risk-high",
    border: "border-brand-risk-high/20",
  },
  Medium: {
    bg: "bg-owasp-warn-bg",
    text: "text-scan-yellow-900",
    border: "border-scan-yellow-900/20",
  },
  Low: {
    bg: "bg-brand-info-bg",
    text: "text-brand-info",
    border: "border-brand-info/20",
  },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

export function RepositoryDetail({ repository, vulnerabilities, trendData }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<RepoTab>("vulnerabilities");
  const [isMonitored, setIsMonitored] = useState(repository.isMonitored);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleRunScan = async () => {
    setIsScanning(true);
    try {
      const res = await scanService.createTargetScan({
        target: repository.id,
        targetType: "Repository",
        surfaceTypes: "ssl",
      });
      if (res.isSuccess && res.value) {
        toast.success(res.value.message || "Scan queued.");
      } else {
        toast.error(res.error?.message ?? "Failed to start scan.");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to start scan.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Back */}
      <Button
        variant="ghost"
        className="w-fit text-brand-gray hover:text-brand-dark"
        onClick={() => router.push("/repositories")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Repositories
      </Button>

      {/* Repo header card */}
      <div className="rounded-lg border border-brand-light-gray bg-white p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-brand-dark">{repository.name}</h1>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-sm font-medium",
                  repository.visibility === "Private"
                    ? "border-brand-indigo/30 bg-brand-indigo-bg text-brand-indigo"
                    : "border-brand-green/30 bg-owasp-green-bg text-brand-green"
                )}
              >
                {repository.visibility === "Private" ? (
                  <Lock className="h-3 w-3" />
                ) : (
                  <Globe className="h-3 w-3" />
                )}
                {repository.visibility}
              </span>
            </div>
            <p className="mb-4 text-brand-gray">{repository.fullName}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-brand-muted">
              <span className="flex items-center gap-1.5">
                <GitBranch className="h-4 w-4" />
                {repository.defaultBranch}
              </span>
              {repository.lastScanDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Last scanned {timeAgo(repository.lastScanDate)}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            className="border-brand-border text-brand-gray hover:bg-brand-medium-gray"
            onClick={handleRunScan}
            disabled={isScanning}
          >
            {isScanning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlayCircle className="mr-2 h-4 w-4" />
            )}
            {isScanning ? "Starting..." : "Run Scan"}
          </Button>
        </div>
      </div>

      {/* Severity stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {SEVERITY_STAT.map(({ key, label, severity, Icon }) => {
          const { bg, text, border } = SEVERITY_CLASSES[severity];
          return (
            <div key={label} className={cn("relative flex flex-col rounded-lg border p-5", bg, border)}>
              <p className={cn("text-sm font-medium pr-12", text)}>{label}</p>
              
              <div className={cn("absolute right-5 top-5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/40", text)}>
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </div>

              <div className="mt-4 flex flex-col">
                <p className={cn("text-[32px] font-semibold leading-none", text)}>{repository[key] as number}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab nav */}
      <div className="border-b border-brand-light-gray">
        <Tabs
          tabs={REPO_TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
          ariaLabel="Repository details tabs"
        />
      </div>

      {/* Vulnerabilities */}
      {activeTab === "vulnerabilities" && (
        <VulnerabilityList vulnerabilities={vulnerabilities} repositoryId={repository.id} />
      )}

      {/* Trends */}
      {activeTab === "trends" && (
        <div className="rounded-lg border border-brand-light-gray bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-brand-dark">
            <TrendingUp className="h-5 w-5 text-owasp-blue" />
            Vulnerability Trends
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
                <XAxis dataKey="date" stroke="#B3B3B3" tick={{ fill: "#666666", fontSize: 12 }} />
                <YAxis stroke="#B3B3B3" tick={{ fill: "#666666", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #EDEDED",
                    borderRadius: "8px",
                    color: "#2b2b2b",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="critical" stroke="#FF3366" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="high" stroke="#F97316" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="medium" stroke="#B27F06" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="low" stroke="#2F80ED" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 rounded-lg border border-brand-light-gray bg-brand-medium-gray p-4">
            <p className="text-sm text-brand-gray">
              <strong className="text-brand-dark">Insight:</strong> Critical vulnerabilities
              increased over the past month. Regular dependency updates are recommended.
            </p>
          </div>
        </div>
      )}

      {/* Monitoring */}
      {activeTab === "monitoring" && (
        <div className="flex flex-col gap-4">
          {/* Continuous monitoring */}
          <div className="rounded-lg border border-brand-light-gray bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-brand-dark">
              <Eye className="h-5 w-5 text-brand-info" />
              Continuous Monitoring
            </h2>
            <div className="flex items-center justify-between rounded-lg bg-brand-medium-gray p-4">
              <div className="flex-1">
                <Label htmlFor="monitoring" className="font-medium text-brand-dark">
                  Enable Continuous Monitoring
                </Label>
                <p className="mt-1 text-sm text-brand-gray">
                  Automatically scan for new CVEs affecting your dependencies
                </p>
              </div>
              <Switch id="monitoring" checked={isMonitored} onCheckedChange={setIsMonitored} />
            </div>
            {isMonitored && (
              <div className="mt-4 space-y-3 border-l-2 border-brand-info pl-5">
                <div>
                  <p className="font-medium text-brand-dark">Scan Frequency</p>
                  <p className="mt-0.5 text-sm text-brand-gray">Daily at 2:00 AM UTC</p>
                </div>
                <div>
                  <p className="font-medium text-brand-dark">Next Scheduled Scan</p>
                  <p className="mt-0.5 text-sm text-brand-gray">Tomorrow at 2:00 AM UTC</p>
                </div>
              </div>
            )}
          </div>

          {/* Alert config */}
          <div className="rounded-lg border border-brand-light-gray bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-brand-dark">
              <Bell className="h-5 w-5 text-scan-yellow-900" />
              Alert Configuration
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-brand-medium-gray p-4">
                <div className="flex-1">
                  <Label htmlFor="email-alerts" className="font-medium text-brand-dark">
                    Email Notifications
                  </Label>
                  <p className="mt-0.5 text-sm text-brand-gray">
                    Receive email alerts for critical and high severity vulnerabilities
                  </p>
                </div>
                <Switch id="email-alerts" checked={emailAlerts} onCheckedChange={setEmailAlerts} />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-brand-medium-gray p-4">
                <div className="flex-1">
                  <Label htmlFor="slack-alerts" className="font-medium text-brand-dark">
                    Slack Notifications
                  </Label>
                  <p className="mt-0.5 text-sm text-brand-gray">
                    Send alerts to your Slack workspace
                  </p>
                </div>
                <Switch id="slack-alerts" checked={slackAlerts} onCheckedChange={setSlackAlerts} />
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-brand-info/20 bg-brand-info-bg p-4">
              <p className="text-sm text-brand-info">
                <strong>Alert Triggers:</strong> You&apos;ll be notified when new critical or high
                severity vulnerabilities are discovered, or when existing vulnerabilities worsen.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
