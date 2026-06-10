"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Plus, Loader2, Globe2, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SecurityPostureTab } from "./security-posture/SecurityPostureTab";
import { PhishingDetectionTab } from "./phishing-detection/PhishingDetectionTab";
import { CredentialMonitoringTab } from "./credential-monitoring/CredentialMonitoringTab";
import { useActiveDomainId, useAddMonitoredEmail } from "../hooks/use-compliance";
import { complianceService } from "../services/compliance.service";
import { AddEmailDialog } from "./credential-monitoring/AddEmailDialog";
import { toast } from "sonner";
import { Tabs, type TabOption } from "@/components/ui/tabs";


// ── Tab definitions ────────────────────────────────────────────────────────

const TABS: TabOption<"owasp" | "phishing" | "credentials">[] = [
  { id: "owasp", label: "Security Posture" },
  { id: "phishing", label: "Phishing Detection" },
  { id: "credentials", label: "Credential Monitoring" },
];

type TabId = "owasp" | "phishing" | "credentials";

// ── Page ───────────────────────────────────────────────────────────────────

export default function TrustCompliancePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("owasp");
  const { activeDomainId, isLoading: domainsLoading, verifiedDomains } = useActiveDomainId();
  const { mutateAsync: addMonitoredEmail, isPending: isAddingEmail } = useAddMonitoredEmail();
  
  const [isExporting, setIsExporting] = useState(false);
  const [isAddEmailOpen, setIsAddEmailOpen] = useState(false);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedDomain = verifiedDomains.find(d => d.id === activeDomainId) || null;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleDomainSelect = (domainId: string) => {
    setDropdownOpen(false);
    router.push(`/trust-compliance?domainId=${encodeURIComponent(domainId)}`);
  };

  const handleExport = async () => {
    if (!activeDomainId) {
      toast.error("No active domain found");
      return;
    }
    try {
      setIsExporting(true);
      await complianceService.downloadReportPdf(activeDomainId);
      toast.success("Report downloaded successfully");
    } catch {
      toast.error("Failed to download report");
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddEmail = async (email: string) => {
    if (!activeDomainId) {
      toast.error("No active domain found");
      return;
    }
    try {
      await addMonitoredEmail({ domainId: activeDomainId, email });
      toast.success("Email added to monitoring");
      setIsAddEmailOpen(false);
    } catch (error) {
      toast.error("Failed to add email");
      throw error; // re-throw so dialog can handle loading state
    }
  };

  return (
    <div className="min-h-[calc(100vh-88px)] bg-brand-dashboard-bg px-4 py-6 md:px-6">
      {/* ── Top bar: tabs + actions ── */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Tab list — scrollable on mobile */}
        <div className="w-full min-w-0 md:max-w-fit pr-4 md:pr-8">
          <Tabs
            tabs={TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
            ariaLabel="Trust and Compliance sections"
            layoutId="trustComplianceTabsIndicator"
          />
        </div>

        {/* Right-side actions */}
        <div className="flex w-full items-center gap-4 md:w-auto md:shrink-0 flex-wrap md:flex-nowrap">
          {/* Domain Selector — available on all tabs */}
          <div ref={dropdownRef} className="relative w-full md:w-64">
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              disabled={domainsLoading}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-scan-primary-900 bg-white px-4 py-3.5 text-scan-primary-900 hover:bg-scan-primary-50 transition-colors disabled:opacity-60 cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Globe2 className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                <span className="truncate font-medium text-[16px]">
                  {domainsLoading ? "Loading..." : selectedDomain?.domain ?? "Select a domain"}
                </span>
              </div>
              <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", dropdownOpen && "rotate-180")} />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg">
                  {verifiedDomains.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-[#9CA3AF]">No verified domains</p>
                  ) : (
                    verifiedDomains.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleDomainSelect(d.id)}
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

          {/* Add Email — only on credentials tab */}
          {activeTab === "credentials" && (
            <button
              type="button"
              onClick={() => setIsAddEmailOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-scan-primary-900 px-4 py-3.5 text-base font-semibold text-scan-primary-900 hover:bg-scan-primary-50 transition-colors md:flex-none"
            >
              <Plus className="h-5 w-5" strokeWidth={2} />
              Add Email
            </button>
          )}

          {/* Export Executive Report */}
          <button
            type="button"
            disabled={isExporting || !activeDomainId}
            onClick={handleExport}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl bg-scan-primary-900 px-5 py-3.5 text-base font-medium text-white hover:bg-scan-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              activeTab === "credentials" ? "flex-1 md:flex-none" : "w-full md:w-auto"
            )}
          >
            {isExporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" strokeWidth={1.8} />}
            Export Executive Report
          </button>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div
        id="tabpanel-owasp"
        role="tabpanel"
        aria-labelledby="tab-owasp"
        hidden={activeTab !== "owasp"}
      >
        {activeTab === "owasp" && <SecurityPostureTab />}
      </div>

      <div
        id="tabpanel-phishing"
        role="tabpanel"
        aria-labelledby="tab-phishing"
        hidden={activeTab !== "phishing"}
      >
        {activeTab === "phishing" && <PhishingDetectionTab />}
      </div>

      <div
        id="tabpanel-credentials"
        role="tabpanel"
        aria-labelledby="tab-credentials"
        hidden={activeTab !== "credentials"}
      >
        {activeTab === "credentials" && <CredentialMonitoringTab />}
      </div>

      {/* ── Add Email Dialog ── */}
      <AddEmailDialog
        open={isAddEmailOpen}
        onOpenChange={setIsAddEmailOpen}
        onSubmit={handleAddEmail}
        isLoading={isAddingEmail}
      />
    </div>
  );
}

