"use client";

import { useState } from "react";
import { Eye, AlertCircle, Shield, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BrandThreat } from "../../types/compliance.types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  Active: {
    bg: "bg-brand-failed-bg", // #FDEBEC
    text: "text-brand-failed-text", // #D00416
    label: "Active",
  },

  Resolved: {
    bg: "bg-owasp-green-bg", // #E8F7EF
    text: "text-brand-green", // #1DAF61
    label: "Resolved",
  },
};

export function TyposquattingDomainsList({
  domains,
}: {
  domains: BrandThreat[];
}) {
  const [selectedDomain, setSelectedDomain] = useState<BrandThreat | null>(null);

  const handleReportProblem = () => {
    toast.success("Sent successfully");
    setSelectedDomain(null);
  };

  return (
    <div className="rounded-xl bg-white p-6 border border-brand-light-gray flex flex-col gap-6">
      {/* Title row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-semibold text-brand-dark leading-none sm:text-2xl">
          Detected Typosquatting Domains
        </h3>
        <div className="flex items-center gap-2 text-brand-gray">
          <Eye className="h-5 w-5 text-brand-gray" strokeWidth={1.8} />
          <span className="text-sm font-normal sm:text-base">Continuous monitoring active</span>
        </div>
      </div>

      {/* List of domains */}
      <div className="flex flex-col gap-4">
        {domains.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-light-gray bg-[#FAFAFA] py-12 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm mb-4">
              <Shield className="h-6 w-6 text-brand-gray opacity-50" />
            </div>
            <h4 className="text-base font-semibold text-brand-dark">No Typosquatting Threats Found</h4>
            <p className="mt-1 text-sm text-brand-gray max-w-sm">
              We are continuously monitoring your domain. Any look-alike domains or typosquatting attempts will appear here.
            </p>
          </div>
        ) : (
          domains.map((item) => {
            const status = STATUS_CONFIG[item.status] || STATUS_CONFIG["Active"];
            
            return (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-xl border border-brand-light-gray bg-white p-4 sm:p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Left side info */}
                <div className="flex flex-col gap-4">
                  {/* Top row with domain and badges */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <AlertCircle className="h-5 w-5 text-brand-failed-text" />
                    <span className="text-base font-normal text-brand-dark">
                      {item.lookAlikeDomain}
                    </span>
                    {/* Status Badge */}
                    <span
                      className={cn(
                        "rounded-lg px-3 py-2 text-xs font-normal leading-none capitalize",
                        status.bg,
                        status.text
                      )}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Subtitle details */}
                  <div className="flex items-center gap-2 text-sm text-brand-gray">
                    <span>Detected: {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Right side action button */}
                <button
                  type="button"
                  onClick={() => setSelectedDomain(item)}
                  className="rounded-lg bg-brand-sidebar-bg px-6 py-4 text-base font-medium text-brand-dark text-center shrink-0 min-w-[136px] h-12 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  View Details
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedDomain} onOpenChange={(open) => !open && setSelectedDomain(null)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[522px] rounded-[12px] p-0 overflow-y-auto max-h-[90vh] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
        >
          {/* Close button */}
          <DialogClose className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] flex items-center justify-center transition-colors z-10">
            <X size={15} className="text-[#374151]" />
            <span className="sr-only">Close</span>
          </DialogClose>

          {selectedDomain && (
            <>
              <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center gap-3">
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                    selectedDomain.status === "Resolved"
                      ? "bg-[#ECFDF5] text-[#10B981]"
                      : "bg-[#FEF2F2] text-[#EF4444]"
                  }`}
                >
                  {selectedDomain.status === "Resolved" ? (
                    <CheckCircle2 size={32} />
                  ) : (
                    <AlertCircle size={32} />
                  )}
                </div>

                {/* Status badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-[20px] ${
                    selectedDomain.status === "Resolved"
                      ? "bg-[#ECFDF5] text-[#10B981]"
                      : "bg-[#FEF2F2] text-[#EF4444]"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      selectedDomain.status === "Resolved" ? "bg-[#10B981]" : "bg-[#EF4444]"
                    }`}
                  />
                  {selectedDomain.status === "Resolved" ? "Resolved" : "Active Threat"}
                </span>

                {/* Title */}
                <DialogTitle className="text-[22px] font-bold text-[#111827] leading-tight">
                  Domain Details
                </DialogTitle>

                <DialogDescription className="sr-only">
                  Details for the detected typosquatting domain.
                </DialogDescription>

                {/* Subtitle */}
                <p className="text-sm font-medium text-[#666666] max-w-xs leading-relaxed">
                  We detected{" "}
                  <span className="font-semibold text-[#2B2B2B]">
                    {selectedDomain.lookAlikeDomain}
                  </span>{" "}
                  as a potential typosquatting threat to your domain.
                </p>
              </div>

              {/* Details card */}
              <div className="mx-6 mb-4 rounded-xl border border-[#DCDCDC] bg-[#F6F6F6] overflow-hidden">
                {[
                  { label: "Domain", value: selectedDomain.lookAlikeDomain },
                  { label: "Variation", value: selectedDomain.variationType },
                  { label: "Risk Level", value: selectedDomain.riskLevel },
                  { label: "DNS Resolves", value: selectedDomain.resolvesViaDns ? "Yes" : "No" },
                  { label: "HTTP Resp", value: selectedDomain.respondedViaHttp ? "Yes" : "No" },
                  { label: "Status", value: selectedDomain.status },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-4 py-3 border-b border-[#DCDCDC] last:border-b-0"
                  >
                    <span className="text-sm font-medium text-[#666666]">{label}</span>
                    <div className="flex items-center gap-2 max-w-[65%] min-w-0">
                      <span
                        className={`text-sm truncate select-all ${
                          label === "Domain"
                            ? "font-medium text-[#666666]"
                            : "font-semibold text-[#2B2B2B]"
                        }`}
                        title={String(value)}
                      >
                        {value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="px-6 pb-6 flex items-center gap-3">
            <DialogClose className="flex-1 h-11 rounded-xl border border-[#E5E7EB] bg-white text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors disabled:opacity-60">
              Close
            </DialogClose>
            {selectedDomain?.status !== "Resolved" && (
              <button
                onClick={handleReportProblem}
                className="flex-1 h-11 rounded-xl bg-red-600 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                Report a problem
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
