"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import {
  Globe,
  Search,
  Filter,
  ArrowUpDown,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import DomainEmptyState from "./DomainEmptyState";
import DomainDetailsModal from "./DomainDetailsModal";
import DeleteDomainModal from "./DeleteDomainModal";
import type { Domain, DomainStatus, VerificationMethod } from "../types/domain.types";
import { toast } from "sonner";
import { domainService } from "../services/domain.service";

interface Props {
  domains: Domain[];
  loading?: boolean;
  error?: string | null;
  onAddDomain: () => void;
  onRetry?: () => void;
}

const METHOD_LABELS: Record<VerificationMethod, string> = {
  DNS_TXT: "DNS TXT",
  FILE_UPLOAD: "File Upload",
  EMAIL: "Email Verification",
};

const STATUS_COLORS: Record<DomainStatus, string> = {
  Verified: "bg-brand-success text-brand-verified-text",
  Pending: "bg-brand-pending-bg text-brand-pending-text",
  Failed: "bg-brand-failed-bg text-brand-failed-text",
  Revoked: "bg-slate-100 text-slate-500",
};

const STATUS_DOTS: Record<DomainStatus, string> = {
  Verified: "bg-brand-verified-text",
  Pending: "bg-brand-pending-text",
  Failed: "bg-brand-failed-text",
  Revoked: "bg-slate-400",
};

function scoreLabel(score: number | null): string {
  if (score === null) return "Not available";
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Poor";
}

function getScoreCircleStyles(score: number | null): { border: string; text: string } {
  if (score === null) return { border: "border-gray-200 border-[4px]", text: "text-gray-400" };
  if (score >= 70) return { border: "border-brand-success border-[4px]", text: "text-brand-success" };
  if (score >= 50) return { border: "border-brand-pending-text border-[4px]", text: "text-brand-pending-text" };
  return { border: "border-brand-failed-text border-[4px]", text: "text-brand-failed-text" };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type SortKey = "NONE" | "DOMAIN_AZ" | "DOMAIN_ZA" | "LAST_SCAN" | "SCORE_HIGH" | "SCORE_LOW";
type MethodFilter = VerificationMethod | "ALL";

// Helper to close all dropdowns
type AllDropdowns = {
  status?: boolean;
  methodMobile?: boolean;
  filter?: boolean;
  sort?: boolean;
};

export default function DomainTable({ domains, loading = false, error = null, onAddDomain, onRetry }: Props) {

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DomainStatus | "ALL">("ALL");
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("NONE");
  // Dropdown open states
  const [statusDropOpen, setStatusDropOpen] = useState(false);
  const [methodMobileOpen, setMethodMobileOpen] = useState(false);
  const [filterDropOpen, setFilterDropOpen] = useState(false);
  const [sortDropOpen, setSortDropOpen] = useState(false);
  const [detailsDomain, setDetailsDomain] = useState<Domain | null>(null);
  const [deleteDomain, setDeleteDomain] = useState<Domain | null>(null);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();

  const handleViewDetails = (domain: Domain) => {
    if (domain.status === "Verified") {
      router.push(`/domain/${domain.id}`);
    } else {
      setDetailsDomain(domain);
    }
  };

  const statusDropRef = useRef<HTMLDivElement>(null);
  const methodMobileRef = useRef<HTMLDivElement>(null);
  const filterDropRef = useRef<HTMLDivElement>(null);
  const sortDropRef = useRef<HTMLDivElement>(null);

  // Close all, then open the requested one
  const openOnly = (which: keyof AllDropdowns) => {
    setStatusDropOpen(which === "status");
    setMethodMobileOpen(which === "methodMobile");
    setFilterDropOpen(which === "filter");
    setSortDropOpen(which === "sort");
  };

  // Click-outside: All Status dropdown
  useEffect(() => {
    if (!statusDropOpen) return;
    const handle = (e: MouseEvent) => {
      if (statusDropRef.current && !statusDropRef.current.contains(e.target as Node)) setStatusDropOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [statusDropOpen]);

  // Click-outside: mobile Method dropdown
  useEffect(() => {
    if (!methodMobileOpen) return;
    const handle = (e: MouseEvent) => {
      if (methodMobileRef.current && !methodMobileRef.current.contains(e.target as Node)) setMethodMobileOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [methodMobileOpen]);

  // Click-outside: desktop Filter dropdown
  useEffect(() => {
    if (!filterDropOpen) return;
    const handle = (e: MouseEvent) => {
      if (filterDropRef.current && !filterDropRef.current.contains(e.target as Node)) setFilterDropOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [filterDropOpen]);

  // Click-outside: desktop Sort dropdown
  useEffect(() => {
    if (!sortDropOpen) return;
    const handle = (e: MouseEvent) => {
      if (sortDropRef.current && !sortDropRef.current.contains(e.target as Node)) setSortDropOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [sortDropOpen]);

  // Only consider domains loaded once loading is done
  const hasDomains = !loading && domains.length > 0;

  const filtered = (() => {
    let list = domains.filter((d) => {
      const matchesSearch = d.domain.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
      const method = d.verificationMethod ?? "DNS_TXT";
      const matchesMethod = methodFilter === "ALL" || method === methodFilter;
      return matchesSearch && matchesStatus && matchesMethod;
    });

    if (sortKey === "NONE") {
      // Default: Latest added first
      list = [...list].sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else if (sortKey === "DOMAIN_AZ") list = [...list].sort((a, b) => a.domain.localeCompare(b.domain));
    else if (sortKey === "DOMAIN_ZA") list = [...list].sort((a, b) => b.domain.localeCompare(a.domain));
    else if (sortKey === "LAST_SCAN") list = [...list].sort((a, b) => {
      if (!a.lastScannedAt && !b.lastScannedAt) return 0;
      if (!a.lastScannedAt) return 1;
      if (!b.lastScannedAt) return -1;
      return new Date(b.lastScannedAt).getTime() - new Date(a.lastScannedAt).getTime();
    });
    else if (sortKey === "SCORE_HIGH") list = [...list].sort((a, b) => (b.lastSecurityScore ?? -1) - (a.lastSecurityScore ?? -1));
    else if (sortKey === "SCORE_LOW") list = [...list].sort((a, b) => (a.lastSecurityScore ?? 999) - (b.lastSecurityScore ?? 999));

    return list;
  })();

  return (
    <div className="space-y-4">

      {/* ── Top bar: always a flex row, search left (conditional), filters right ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">

        {/* Search input — only when domains exist, sits on the left */}
        {hasDomains && (
          <div className="relative w-full sm:max-w-xs">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-slate"
            />
            <input
              type="text"
              placeholder="Search domains..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 h-10 text-[14px] font-medium rounded-[12px] border border-brand-input-border bg-white text-brand-slate placeholder:text-brand-slate-light placeholder:font-medium placeholder:text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        {/* Filters — ALWAYS visible, pushed to the right via ml-auto */}
        <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">

        {/* All Status — always visible, closes siblings */}
        <div className="relative flex-1 sm:flex-none" ref={statusDropRef}>
          <button
            onClick={() => statusDropOpen ? setStatusDropOpen(false) : openOnly("status")}
            className={`flex items-center justify-between sm:justify-start w-full sm:w-auto gap-1.5 h-10 px-3 text-[14px] font-medium rounded-[12px] border bg-white hover:bg-gray-50 transition-colors ${
              statusFilter !== "ALL" ? "border-primary text-primary" : "border-brand-input-border text-brand-slate-light"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Filter size={14} className="sm:hidden stroke-[1.25]" />
              <span>{statusFilter === "ALL" ? "All Status" : statusFilter}</span>
              {statusFilter !== "ALL" && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </div>
            <ChevronDown size={14} className={`transition-transform ${statusDropOpen ? "rotate-180" : ""}`} />
          </button>
          {statusDropOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 top-11 z-50 w-full sm:w-40 bg-white rounded-[12px] border border-brand-input-border shadow-lg overflow-hidden">
              <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</p>
              {(["ALL", "Verified", "Pending", "Failed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setStatusDropOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    statusFilter === s ? "bg-primary/5 text-primary font-medium" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {s === "ALL" ? "All Status" : s}
                </button>
              ))}
            </div>
          )}
        </div>

          {/* All Method — mobile only, fully wired */}
          <div className="relative flex-1 sm:hidden" ref={methodMobileRef}>
            <button
              onClick={() => methodMobileOpen ? setMethodMobileOpen(false) : openOnly("methodMobile")}
              className={`flex items-center justify-between w-full gap-1.5 h-10 px-3 text-[14px] font-medium rounded-[12px] border bg-white hover:bg-gray-50 transition-colors ${
                methodFilter !== "ALL" ? "border-primary text-primary" : "border-brand-input-border text-brand-slate-light"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>{methodFilter === "ALL" ? "All Method" : METHOD_LABELS[methodFilter]}</span>
                {methodFilter !== "ALL" && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </div>
              <ChevronDown size={14} className={`transition-transform ${methodMobileOpen ? "rotate-180" : ""}`} />
            </button>
            {methodMobileOpen && (
              <div className="absolute left-0 top-11 z-50 w-full bg-white rounded-[12px] border border-brand-input-border shadow-lg overflow-hidden">
                <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Verification Method</p>
                {(["ALL", "DNS_TXT", "FILE_UPLOAD", "EMAIL"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMethodFilter(m); setMethodMobileOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      methodFilter === m ? "bg-primary/5 text-primary font-medium" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {m === "ALL" ? "All Methods" : METHOD_LABELS[m]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop-only: Filter button — filters by Verification Method */}
          <div className="relative hidden sm:block" ref={filterDropRef}>
            <button
              onClick={() => filterDropOpen ? setFilterDropOpen(false) : openOnly("filter")}
              className={`flex items-center gap-1.5 h-10 px-3 text-sm rounded-[12px] border bg-white text-gray-700 hover:bg-gray-50 transition-colors ${
                methodFilter !== "ALL" ? "border-primary text-primary font-medium" : "border-brand-input-border"
              }`}
            >
              <Filter size={14} />
              <span>Filter</span>
              {methodFilter !== "ALL" && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary ml-0.5" />
              )}
            </button>
            {filterDropOpen && (
              <div className="absolute right-0 top-11 z-50 w-52 bg-white rounded-[12px] border border-brand-input-border shadow-lg overflow-hidden">
                <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Verification Method</p>
                {(["ALL", "DNS_TXT", "FILE_UPLOAD", "EMAIL"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMethodFilter(m); setFilterDropOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      methodFilter === m
                        ? "bg-primary/5 text-primary font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {m === "ALL" ? "All Methods" : METHOD_LABELS[m]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop-only: Sort button */}
          <div className="relative hidden sm:block" ref={sortDropRef}>
            <button
              onClick={() => sortDropOpen ? setSortDropOpen(false) : openOnly("sort")}
              className={`flex items-center gap-1.5 h-10 px-3 text-sm rounded-[12px] border bg-white text-gray-700 hover:bg-gray-50 transition-colors ${
                sortKey !== "NONE" ? "border-primary text-primary font-medium" : "border-brand-input-border"
              }`}
            >
              <ArrowUpDown size={14} />
              <span>Sort</span>
              {sortKey !== "NONE" && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary ml-0.5" />
              )}
            </button>
            {sortDropOpen && (
              <div className="absolute right-0 top-11 z-50 w-52 bg-white rounded-[12px] border border-brand-input-border shadow-lg overflow-hidden">
                <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Sort by</p>
                {([
                  { key: "NONE", label: "Default" },
                  { key: "DOMAIN_AZ", label: "Domain A → Z" },
                  { key: "DOMAIN_ZA", label: "Domain Z → A" },
                  { key: "LAST_SCAN", label: "Last Scan (newest)" },
                  { key: "SCORE_HIGH", label: "Security Score (high → low)" },
                  { key: "SCORE_LOW", label: "Security Score (low → high)" },
                ] as const).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => { setSortKey(key as SortKey); setSortDropOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      sortKey === key
                        ? "bg-primary/5 text-primary font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Card List (hidden on sm+) ── */}
      <div className="sm:hidden flex flex-col gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 bg-white rounded-[12px] border border-brand-input-border">
            <Loader2 size={24} className="animate-spin text-primary" />
            <span className="sr-only">Loading domains...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-[12px] border border-brand-input-border gap-3">
            <p className="text-sm text-gray-500 font-geist text-center">{error}</p>
            {onRetry && (
              <Button variant="outline" onClick={onRetry} className="text-sm">
                Retry
              </Button>
            )}
          </div>
        ) : !hasDomains ? (
          <div className="bg-white rounded-[12px] border border-brand-input-border p-8 shadow-sm">
            <DomainEmptyState onAddDomain={onAddDomain} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-[8px] border border-black/10">
            <p className="text-[16px] font-semibold text-brand-dark font-geist">No domains found</p>
            <p className="text-xs text-gray-500 font-geist mt-1 text-center">
              We couldn&apos;t find any domains matching your search or filters.
            </p>
          </div>
        ) : (
          filtered.map((domain) => (
              <div
              key={domain.id}
              className="bg-white rounded-[8px] border border-black/10 p-4 flex flex-col gap-3 shadow-sm animate-in fade-in duration-200"
            >
              <p className="text-[20px] font-medium text-brand-dark font-geist leading-tight">
                {domain.domain}
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[14px] font-normal text-brand-slate font-geist">
                  {formatDate(domain.createdAt)}
                </p>
                <button
                  onClick={() => handleViewDetails(domain)}
                  className="text-[14px] font-bold text-brand-dark font-geist hover:underline cursor-pointer bg-transparent border-0 p-0"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Desktop Table (hidden on mobile) ── */}
      <div className="hidden sm:block bg-white rounded-[12px] border border-brand-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border bg-gray-50">
                <th className="text-left px-4 py-5 text-[14px] font-medium text-brand-dark whitespace-nowrap font-geist">
                  <span className="flex items-center gap-1">
                    Domain
                    <ArrowUpDown size={14} className="text-brand-dark" />
                  </span>
                </th>
                <th className="text-left px-4 py-5 text-[14px] font-medium text-brand-dark whitespace-nowrap font-geist">
                  Verification Method
                </th>
                <th className="text-left px-4 py-5 text-[14px] font-medium text-brand-dark whitespace-nowrap font-geist">
                  <span className="flex items-center gap-1">
                    Status
                    <ArrowUpDown size={14} className="text-brand-dark" />
                  </span>
                </th>
                <th className="text-left px-4 py-5 text-[14px] font-medium text-brand-dark whitespace-nowrap font-geist">
                  Last Scan
                </th>
                <th className="text-left px-4 py-5 text-[14px] font-medium text-brand-dark whitespace-nowrap font-geist">
                  Security Score
                </th>
                <th className="text-left px-4 py-5 text-[14px] font-medium text-brand-dark whitespace-nowrap font-geist">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-primary" />
                      <span className="sr-only">Loading domains...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <p className="text-sm text-gray-500 font-geist">{error}</p>
                      {onRetry && (
                        <Button variant="outline" onClick={onRetry} className="text-sm">
                          Retry
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : !hasDomains ? (
                /* Empty state — no domains at all */
                <tr>
                  <td colSpan={6} className="px-4 py-8">
                    <DomainEmptyState onAddDomain={onAddDomain} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                /* Search/filter returns nothing */
                <tr>
                  <td colSpan={6} className="text-center py-16 font-geist">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-[16px] font-semibold text-brand-dark">No domains found</p>
                      <p className="text-sm text-gray-500 mt-1">
                        We couldn&apos;t find any domains matching your current search or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((domain) => (
                  <tr
                    key={domain.id}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-globe-bg flex items-center justify-center shrink-0">
                          <Globe size={14} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-brand-dark leading-tight">{domain.domain}</p>
                          <p className="text-xs font-medium text-brand-muted mt-0.5">
                            Added on {formatDate(domain.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {(() => {
                        const method = domain.verificationMethod ?? "DNS_TXT";
                        return (
                          <span
                            className="inline-flex items-center gap-1.5 rounded-[12px] text-[14px] font-medium text-brand-dark bg-brand-light-gray"
                            style={{ padding: "4px 10px" }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            {METHOD_LABELS[method]}
                          </span>
                        );
                      })()}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[12px] text-xs font-medium ${STATUS_COLORS[domain.status] ?? "bg-gray-100 text-gray-500"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${STATUS_DOTS[domain.status] ?? "bg-gray-400"}`}
                        />
                        {domain.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {domain.lastScannedAt ? (
                        <>
                          <p className="text-[14px] font-medium text-brand-dark leading-normal">{formatDate(domain.lastScannedAt)}</p>
                          <p className="text-xs font-medium text-brand-muted leading-normal mt-0.5">
                            {new Date(domain.lastScannedAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </p>
                        </>
                      ) : (
                        <span className="text-brand-muted text-xs font-medium">Not scanned yet</span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {domain.lastSecurityScore !== null ? (
                        <div className="flex items-center gap-2 font-geist">
                          {(() => {
                            const { border, text } = getScoreCircleStyles(domain.lastSecurityScore);
                            return (
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-[16px] font-bold bg-transparent ${border} ${text}`}
                              >
                                {domain.lastSecurityScore}
                              </div>
                            );
                          })()}
                          <span className="text-[14px] font-medium text-brand-dark">
                            {scoreLabel(domain.lastSecurityScore)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-geist">Not available</span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(domain)}
                          className="text-xs h-8 px-3 rounded-lg border border-brand-border text-brand-dark font-medium bg-white hover:bg-gray-50"
                        >
                          View Details
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              aria-label="Row actions"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-dark bg-transparent hover:bg-gray-50/50 border-0 outline-hidden cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
                            >
                              <MoreVertical size={14} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32 min-w-32 bg-white rounded-xl border border-gray-200 shadow-lg p-0 overflow-hidden">
                            {domain.status !== "Verified" && (
                              <DropdownMenuItem
                                onClick={async () => {
                                  const toastId = toast.loading("Checking DNS verification...", {
                                    description: `Verifying ${domain.domain}`,
                                  });
                                  try {
                                    const updatedDomain = await domainService.verifyDomain(domain.id);
                                    if (updatedDomain.status === "Verified") {
                                      toast.success("Domain verified successfully!", {
                                        id: toastId,
                                        description: `${domain.domain} is now verified.`,
                                      });
                                    } else {
                                      toast.error("Verification failed. DNS records might still be propagating.", {
                                        id: toastId,
                                        description: `${domain.domain} remains pending.`,
                                      });
                                    }
                                    if (onRetry) onRetry();
                                  } catch (err: unknown) {
                                    const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
                                    const backendMessage = axiosError.response?.data?.error?.message;
                                    const errMsg = backendMessage || (err instanceof Error ? err.message : "Verification failed. DNS records might still be propagating.");
                                    toast.error(errMsg, {
                                      id: toastId,
                                    });
                                    if (onRetry) onRetry();
                                  }
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:text-gray-700 rounded-none cursor-pointer"
                              >
                                Re-verify
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setDeleteDomain(domain);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 focus:bg-red-50 focus:text-red-500 rounded-none cursor-pointer"
                            >
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DomainDetailsModal
        domain={detailsDomain}
        open={detailsDomain !== null}
        onOpenChange={(open) => { if (!open) setDetailsDomain(null); }}
        onDeleted={onRetry}
      />

      <DeleteDomainModal
        domain={deleteDomain}
        open={deleteDomain !== null}
        deleting={deleting}
        onCancel={() => setDeleteDomain(null)}
        onConfirm={async () => {
          if (!deleteDomain) return;
          setDeleting(true);
          const toastId = toast.loading("Removing domain...", {
            description: `Deleting ${deleteDomain.domain}`,
          });
          try {
            const res = await domainService.deleteDomain(deleteDomain.id);
            toast.success(res.message || "Domain removed successfully!", { id: toastId });
            setDeleteDomain(null);
            if (onRetry) onRetry();
          } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
            const backendMessage = axiosError.response?.data?.error?.message;
            const errMsg = backendMessage || (err instanceof Error ? err.message : "Failed to remove domain.");
            toast.error(errMsg, { id: toastId });
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}
