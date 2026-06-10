"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  CircleGauge,
  Globe2,
  ShieldAlert,
  ShieldCheck,
  ShieldEllipsis,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { domainService } from "@/features/domain/services/domain.service";
import { scanService, ScanHistoryItem } from "@/features/scans/services/scan.service";
import type { Domain } from "@/features/domain/types/domain.types";
import { ReportStatCards } from "./ReportStatCards";
import { ReportScansTable } from "./ReportScansTable";

export default function Report() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const domainId = searchParams.get("domainId");
  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const [domains, setDomains] = useState<Domain[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const selectedDomain = domains.find((d) => d.id === domainId) ?? null;
  const [domainsLoading, setDomainsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch domains list once on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await domainService.getDomains();
        const verified = res.data.filter((d) => d.status === "Verified");
        setDomains(verified);
        if (!domainId && verified.length > 0) {
          router.replace(`/report?domainId=${encodeURIComponent(verified[0].id)}`);
        }

      } finally {
        setDomainsLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Fetch scan history when domainId or page changes
  useEffect(() => {
    if (!domainId) return;
    const load = async () => {
      setHistoryLoading(true);
      try {
        const res = await scanService.getScanHistory(domainId, { 
          page, 
          page_size: 5,
          sort_by: "createdAt",
          order: "desc"
        });
        if (res.isSuccess && res.value) {
          const total = res.value.totalPages || 1;
          setHistory(res.value.data || []);
          setTotalPages(total);
          if (page > total) {
            router.replace(`/report?domainId=${encodeURIComponent(domainId)}&page=${total}`);
          }
        }
      } catch {
        setHistory([]);
        setTotalPages(1);
      } finally {
        setHistoryLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainId, page]);

  const handleDomainSelect = (domain: Domain) => {
    setDropdownOpen(false);
    router.push(`/report?domainId=${encodeURIComponent(domain.id)}`);
  };

  const handlePageChange = (p: number) => {
    router.push(`/report?domainId=${encodeURIComponent(domainId || "")}&page=${p}`);
  };

  // Derive stat counts from history
  const highRisk = history.filter((h) => {
    const r = h.riskLevel?.toLowerCase();
    return r === "critical" || r === "high";
  }).length;
  const medRisk = history.filter((h) => {
    const r = h.riskLevel?.toLowerCase();
    return r === "medium" || r === "moderate";
  }).length;
  const lowRisk = history.filter((h) => !h.riskLevel || h.riskLevel.toLowerCase() === "low").length;

  const securityScore = selectedDomain?.lastSecurityScore ?? null;

  const summaryCards = [
    {
      label: "Security Score",
      value: securityScore !== null ? `${securityScore}` : "—",
      suffix: securityScore !== null ? "/100" : "",
      icon: CircleGauge,
      iconClassName: "text-brand-info",
      iconWrapClassName: "bg-brand-info-bg",
    },
    {
      label: "High Risk Found",
      value: highRisk,
      suffix: "",
      icon: ShieldAlert,
      iconClassName: "text-brand-risk-critical",
      iconWrapClassName: "bg-brand-risk-critical-bg",
    },
    {
      label: "Medium Risk Found",
      value: medRisk,
      suffix: "",
      icon: ShieldEllipsis,
      iconClassName: "text-brand-risk-high",
      iconWrapClassName: "bg-brand-risk-high-bg",
    },
    {
      label: "Low Risk Found",
      value: lowRisk,
      suffix: "",
      icon: ShieldCheck,
      iconClassName: "text-brand-risk-low",
      iconWrapClassName: "bg-brand-risk-low-bg",
    },
  ];

  return (
    <div className="px-4 py-5 md:px-6 lg:px-4 lg:py-3">
      <div className="space-y-6">

        {/* Title + Domain Selector row */}
        <div className="flex items-center justify-between gap-4">
          <div className="hidden md:block lg:hidden">
            <h1 className="text-2xl font-semibold text-[#2B2B2B]">Report Overview</h1>
            <p className="text-sm text-[#666666]">Summary of all security reports</p>
          </div>

          {/* Domain Selector */}
          <div ref={dropdownRef} className="relative w-full sm:w-72 sm:ml-auto">
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            disabled={domainsLoading}
            className="flex w-full items-center justify-between gap-2 rounded-xl border-2 border-[#EBE5E7] bg-white px-4 py-2.5 text-[#2B2B2B] hover:border-[#D1D5DB] transition-colors disabled:opacity-60 cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Globe2 className="h-5 w-5 shrink-0" strokeWidth={1.8} />
              <span className="truncate font-normal text-[16px]">
                {domainsLoading ? "Loading..." : selectedDomain?.domain ?? "Select a domain"}
              </span>
            </div>
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform", dropdownOpen && "rotate-180")} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg">
                {domains.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-[#9CA3AF]">No verified domains</p>
                ) : (
                  domains.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleDomainSelect(d)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                    >
                      <span className="truncate">{d.domain}</span>
                      {d.id === selectedDomain?.id && (
                        <span className="ml-2 h-2 w-2 rounded-full bg-[#072E28] shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
        </div>

        {/* Stat Cards */}
        <ReportStatCards summaryCards={summaryCards} loading={historyLoading} />

        {/* Recent Scans */}
        <ReportScansTable
          history={history}
          loading={historyLoading}
          domainId={domainId}
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
