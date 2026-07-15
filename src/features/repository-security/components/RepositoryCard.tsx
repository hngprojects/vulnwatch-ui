"use client";

import { useState } from "react";
import Link from "next/link";
import { GitBranch, Lock, Globe, Calendar, PlayCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { scanService } from "@/features/scans/services/scan.service";
import type { Repository, SeverityLevel } from "../types/repository.types";

interface Props {
  repository: Repository;
}

type SeverityConfig = { bg: string; text: string; border: string };

const SEVERITY_CONFIG: Record<SeverityLevel, SeverityConfig> = {
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

const EMPTY_CONFIG: SeverityConfig = {
  bg: "bg-brand-medium-gray",
  text: "text-brand-muted",
  border: "border-brand-light-gray",
};

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "unknown";
  
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

function SeverityBadge({
  label,
  count,
  severity,
}: {
  label: string;
  count: number;
  severity: SeverityLevel;
}) {
  const { bg, text, border } = count > 0 ? SEVERITY_CONFIG[severity] : EMPTY_CONFIG;
  return (
    <div className={cn("flex flex-col rounded-lg border p-3", bg, border)}>
      <span className={cn("text-2xl font-bold", text)}>{count}</span>
      <span className={cn("mt-0.5 text-xs", text)}>{label}</span>
    </div>
  );
}

export function RepositoryCard({ repository }: Props) {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
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
    <div className="flex flex-col gap-4 rounded-lg border border-brand-light-gray bg-white p-5 transition-shadow hover:shadow-sm">
      {/* Header */}
      <div>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-brand-dark">{repository.name}</h3>
          {/* Visibility pill */}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
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
          {repository.isMonitored && (
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-info/30 bg-brand-info-bg px-2 py-0.5 text-xs font-medium text-brand-info">
              Monitored
            </span>
          )}
        </div>
        <p className="text-sm text-brand-gray">{repository.fullName}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-brand-muted">
          <span className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            {repository.defaultBranch}
          </span>
          {repository.lastScanDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Scanned {timeAgo(repository.lastScanDate)}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      {repository.lastScanDate ? (
        <>
          <div className="grid grid-cols-4 gap-2">
            <SeverityBadge label="Critical" count={repository.criticalFindings} severity="Critical" />
            <SeverityBadge label="High" count={repository.highFindings} severity="High" />
            <SeverityBadge label="Medium" count={repository.mediumFindings} severity="Medium" />
            <SeverityBadge label="Low" count={repository.lowFindings} severity="Low" />
          </div>
          <div className="flex gap-2">
            <Link href={`/repositories/${repository.id}`} className="flex-1">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary-hover">
                View Details
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-brand-border text-brand-gray hover:bg-brand-medium-gray"
              onClick={handleScan}
              disabled={isScanning}
            >
              {isScanning ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <PlayCircle className="mr-1.5 h-4 w-4" />
              )}
              {isScanning ? "Starting..." : "Rescan"}
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg border border-brand-light-gray bg-brand-medium-gray p-4 text-center">
            <p className="text-sm text-brand-gray">No scan data available</p>
          </div>
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary-hover"
            onClick={handleScan}
            disabled={isScanning}
          >
            {isScanning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlayCircle className="mr-2 h-4 w-4" />
            )}
            {isScanning ? "Starting..." : "Scan Repository"}
          </Button>
        </div>
      )}
    </div>
  );
}
