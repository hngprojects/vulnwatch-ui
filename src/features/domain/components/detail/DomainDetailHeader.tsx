"use client";

import Link from "next/link";
import { CheckCircle2, ChevronLeft, Loader2, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface DomainDetailHeaderProps {
  domainName: string;
  domainStatus: "Verified" | "Pending" | "Failed" | "Revoked";
  monitoringActive: boolean;
  onMonitoringChange: (active: boolean) => void;
  onRunScan: () => void;
  isLaunching?: boolean;
  backHref?: string;
}

export function DomainDetailHeader({
  domainName,
  domainStatus,
  monitoringActive,
  onMonitoringChange,
  onRunScan,
  isLaunching = false,
  backHref = "/domain",
}: DomainDetailHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Back link */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors text-sm"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Domains
      </Link>

      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Domain name + verified badge */}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900 font-geist">{domainName}</h1>
          {domainStatus === "Verified" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={onRunScan}
            disabled={isLaunching}
            className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-4 font-semibold disabled:opacity-60"
          >
            {isLaunching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ScanLine className="h-4 w-4" />
            )}
            {isLaunching ? "Starting..." : "Run New Scan"}
          </Button>

          {/* Active Monitoring toggle */}
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 font-geist leading-tight">
                Active Monitoring
              </p>
              <p className="text-xs text-slate-500 leading-tight mt-0.5">
                {monitoringActive ? "Scanning in progress" : "Monitoring paused"}
              </p>
            </div>
            <Switch
              checked={monitoringActive}
              onCheckedChange={onMonitoringChange}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
