"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FindingsItemCard from "@/features/scans/scan-report/ui/FindingsItemCard";
import ScanReportPageHeader from "@/features/scans/scan-report/ui/ScanReportPageHeader";
import ScanReportScoreStatCard from "@/features/scans/scan-report/ui/ScanReportStatCard";
import Card from "@/features/scans/shared/ui/Card";
import PageHeader from "@/features/scans/shared/ui/PageHeader";
import { ChevronRight, Loader2, AlertCircle } from "lucide-react";
import SecurityScoreCard from "@/features/scans/scan-report/ui/SecurityScoreCard";
import { scanService, ScanReport } from "@/features/scans/services/scan.service";
import { AIChatbot } from "@/features/ai-chat/components/AIChatbot";
import { toast } from "sonner";

const CustomCheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M5.12042 1.74595C5.8921 1.68437 6.62469 1.38092 7.21389 0.878803C8.58886 -0.292934 10.6111 -0.292934 11.9861 0.878803C12.5753 1.38092 13.3079 1.68437 14.0796 1.74595C15.8804 1.88965 17.3103 3.31963 17.4541 5.12042C17.5156 5.8921 17.8191 6.62469 18.3212 7.21389C19.4929 8.58886 19.4929 10.6111 18.3212 11.9861C17.8191 12.5753 17.5156 13.3079 17.4541 14.0796C17.3103 15.8804 15.8804 17.3103 14.0796 17.4541C13.3079 17.5156 12.5753 17.8191 11.9861 18.3212C10.6111 19.4929 8.58886 19.4929 7.21389 18.3212C6.62469 17.8191 5.8921 17.5156 5.12042 17.4541C3.31963 17.3103 1.88965 15.8804 1.74595 14.0796C1.68437 13.3079 1.38092 12.5753 0.878803 11.9861C-0.292934 10.6111 -0.292934 8.58886 0.878803 7.21389C1.38092 6.62469 1.68437 5.8921 1.74595 5.12042C1.88965 3.31963 3.31963 1.88965 5.12042 1.74595ZM14.0485 8.04853C14.5172 7.5799 14.5172 6.8201 14.0485 6.35147C13.5799 5.88284 12.8201 5.88284 12.3515 6.35147L8.4 10.3029L6.84853 8.75147C6.3799 8.28284 5.6201 8.28284 5.15147 8.75147C4.68284 9.2201 4.68284 9.9799 5.15147 10.4485L7.55147 12.8485C8.0201 13.3172 8.7799 13.3172 9.24853 12.8485L14.0485 8.04853Z" fill="currentColor" />
  </svg>
);

const ViewFindingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.6116 9.47734L10.7147 8.04062L9.2749 4.14062C9.16479 3.84201 8.96579 3.58434 8.7047 3.40234C8.44361 3.22034 8.133 3.12276 7.81474 3.12276C7.49648 3.12276 7.18587 3.22034 6.92478 3.40234C6.6637 3.58434 6.46469 3.84201 6.35458 4.14062L4.91787 8.04062L1.01787 9.47734C0.719255 9.58745 0.461581 9.78645 0.27958 10.0475C0.097578 10.3086 0 10.6192 0 10.9375C0 11.2558 0.097578 11.5664 0.27958 11.8275C0.461581 12.0885 0.719255 12.2876 1.01787 12.3977L4.91474 13.8344L6.35458 17.7344C6.46469 18.033 6.6637 18.2907 6.92478 18.4727C7.18587 18.6547 7.49648 18.7522 7.81474 18.7522C8.133 18.7522 8.44361 18.6547 8.7047 18.4727C8.96579 18.2907 9.16479 18.033 9.2749 17.7344L10.7116 13.8375L14.6116 12.3977C14.9102 12.2876 15.1679 12.0885 15.3499 11.8275C15.5319 11.5664 15.6295 11.2558 15.6295 10.9375C15.6295 10.6192 15.5319 10.3086 15.3499 10.0475C15.1679 9.78645 14.9102 9.58745 14.6116 9.47734ZM9.66005 12.2242C9.5328 12.2711 9.41723 12.3451 9.32133 12.441C9.22543 12.5369 9.15148 12.6524 9.10458 12.7797L7.81474 16.2719L6.52802 12.7797C6.48112 12.6524 6.40717 12.5369 6.31127 12.441C6.21537 12.3451 6.09981 12.2711 5.97255 12.2242L2.48037 10.9375L5.97255 9.65078C6.09981 9.60388 6.21537 9.52993 6.31127 9.43403C6.40717 9.33813 6.48112 9.22257 6.52802 9.09531L7.81474 5.60313L9.10146 9.09531C9.14836 9.22257 9.22231 9.33813 9.31821 9.43403C9.41411 9.52993 9.52967 9.60388 9.65693 9.65078L13.1491 10.9375L9.66005 12.2242ZM10.0022 2.8125C10.0022 2.56386 10.101 2.3254 10.2768 2.14959C10.4526 1.97377 10.6911 1.875 10.9397 1.875H11.8772V0.9375C11.8772 0.68886 11.976 0.450403 12.1518 0.274587C12.3276 0.098772 12.5661 0 12.8147 0C13.0634 0 13.3018 0.098772 13.4777 0.274587C13.6535 0.450403 13.7522 0.68886 13.7522 0.9375V1.875H14.6897C14.9384 1.875 15.1768 1.97377 15.3527 2.14959C15.5285 2.3254 15.6272 2.56386 15.6272 2.8125C15.6272 3.06114 15.5285 3.2996 15.3527 3.47541C15.1768 3.65123 14.9384 3.75 14.6897 3.75H13.7522V4.6875C13.7522 4.93614 13.6535 5.1746 13.4777 5.35041C13.3018 5.52623 13.0634 5.625 12.8147 5.625C12.5661 5.625 12.3276 5.52623 12.1518 5.35041C11.976 5.1746 11.8772 4.93614 11.8772 4.6875V3.75H10.9397C10.6911 3.75 10.4526 3.65123 10.2768 3.47541C10.101 3.2996 10.0022 3.06114 10.0022 2.8125ZM18.7522 6.5625C18.7522 6.81114 18.6535 7.0496 18.4777 7.22541C18.3018 7.40123 18.0634 7.5 17.8147 7.5H17.5022V7.8125C17.5022 8.06114 17.4035 8.2996 17.2277 8.47541C17.0518 8.65123 16.8134 8.75 16.5647 8.75C16.3161 8.75 16.0776 8.65123 15.9018 8.47541C15.726 8.2996 15.6272 8.06114 15.6272 7.8125V7.5H15.3147C15.0661 7.5 14.8276 7.40123 14.6518 7.22541C14.476 7.0496 14.3772 6.81114 14.3772 6.5625C14.3772 6.31386 14.476 6.0754 14.6518 5.89959C14.8276 5.72377 15.0661 5.625 15.3147 5.625H15.6272V5.3125C15.6272 5.06386 15.726 4.8254 15.9018 4.64959C16.0776 4.47377 16.3161 4.375 16.5647 4.375C16.8134 4.375 17.0518 4.47377 17.2277 4.64959C17.4035 4.8254 17.5022 5.06386 17.5022 5.3125V5.625H17.8147C18.0634 5.625 18.3018 5.72377 18.4777 5.89959C18.6535 6.0754 18.7522 6.31386 18.7522 6.5625Z" fill="currentColor"/>
  </svg>
);

const formatScannedDate = (dateString?: string) => {
  if (!dateString) return "Scanned date unknown";
  try {
    const date = new Date(dateString);
    const time = date.getTime();
    if (!Number.isFinite(time)) {
      return "Scanned date unknown";
    }
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    
    const suffix = (day: number) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
      }
    };
    
    return `Scanned ${day}${suffix(day)} ${month} ${year}`;
  } catch {
    return "Scanned date unknown";
  }
};

function ScanReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scanId = searchParams.get("scanId");
  const [report, setReport] = useState<ScanReport | null>(null);
  const [loading, setLoading] = useState(!!scanId);
  const [error, setError] = useState<string | null>(scanId ? null : "No Scan ID provided.");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRescanning, setIsRescanning] = useState(false);

  const handleRescan = async () => {
    if (!report || isRescanning) return;
    try {
      setIsRescanning(true);
      const response = await scanService.createScan({
        domainId: report.domainId,
        scanType: "QUICK_SCAN",
      });
      if (response.isSuccess && response.value) {
        if (
          response.value.message === "A scan is already in progress for this domain." ||
          response.value.message === "Scan already initiated."
        ) {
          toast.info(response.value.message);
        }
        const { scanId: newScanId, initiatedAt } = response.value;
        const activeInitiatedAt = initiatedAt || new Date().toISOString();
        router.push(
          `/scan/progress?scanId=${encodeURIComponent(newScanId)}&domain=${encodeURIComponent(report.domainName)}&initiatedAt=${encodeURIComponent(activeInitiatedAt)}`
        );
      } else {
        toast.error(response.error?.message || "Failed to start scan.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      toast.error(msg);
    } finally {
      setIsRescanning(false);
    }
  };

  useEffect(() => {
    if (!scanId) return;

    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await scanService.getScanReport(scanId);
        if (res.isSuccess && res.value) {
          setReport(res.value);
        } else {
          const errorMsg = res.error?.message || "";
          if (errorMsg.includes("Scan is not complete") || (res.error?.code === "Validation" && errorMsg.toLowerCase().includes("not complete"))) {
            router.push(`/scan/progress?scanId=${encodeURIComponent(scanId)}`);
            return;
          }
          setError(errorMsg || "Failed to retrieve the scan report.");
        }
      } catch (err: unknown) {
        const axiosError = err as { response?: { status?: number; data?: { isSuccess?: boolean; error?: { message?: string } } } };
        const responseData = axiosError.response?.data;
        if (responseData && responseData.error) {
          const apiError = responseData.error;
          if (apiError.message && apiError.message.includes("Scan is not complete")) {
            router.push(`/scan/progress?scanId=${encodeURIComponent(scanId)}`);
            return;
          }
          setError(apiError.message || `Request failed with status code ${axiosError.response?.status || 'unknown'}`);
        } else {
          const msg = err instanceof Error ? err.message : "An unexpected error occurred while loading the report.";
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [scanId, router]);

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-2 p-5">
        <Loader2 className="h-8 w-8 animate-spin text-[#072e28]" />
        <p className="text-neutral-500 font-medium text-sm">Loading security report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-5 max-w-md mx-auto mt-16 font-geist">
        <div className="rounded-xl border border-neutral-200 bg-white p-8 flex flex-col items-center text-center gap-5 shadow-sm">
          <div className="rounded-full bg-red-50 p-3.5">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[#111827]">Failed to load report</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              {error || "The report could not be found."}
            </p>
          </div>
          <Button asChild className="w-full mt-2 bg-[#072e28] text-white hover:bg-[#072e28]/90 font-semibold h-11">
            <Link href="/scan">Back to Scan Setup</Link>
          </Button>
        </div>
      </div>
    );
  }

  const detailsHref = scanId
    ? `/scan/${encodeURIComponent(scanId)}/ai-summary`
    : null;

  const criticalCount = report.findingGroups?.criticalCount ?? 0;
  const highCount = report.findingGroups?.highCount ?? 0;
  
  const firstCritical = report.summary?.criticalIssues?.[0];
  const criticalText = firstCritical
    ? (typeof firstCritical === "string" ? firstCritical : firstCritical.title)
    : "No critical issues detected on your domain.";

  const firstHigh = report.summary?.highSeverityIssues?.[0];
  const highText = firstHigh
    ? (typeof firstHigh === "string" ? firstHigh : firstHigh.title)
    : "No high-severity issues detected on your domain.";

  const goodNewsText = report.summary?.goodNews || "Your domain shows good base security configurations.";

  const findings = [
    {
      findingsCount: report.findingGroups?.criticalCount ?? 0,
      description: "Could cause serious harm if not fixed soon",
      score: 12, // Critical range (0-20)
      severity: "critical",
    },
    {
      findingsCount: report.findingGroups?.highCount ?? 0,
      description: "Important to fix within the next 2 weeks",
      score: 32, // High priority range (21-40)
      severity: "high",
    },
    {
      findingsCount: report.findingGroups?.mediumCount ?? 0,
      description: "Should be addressed when possible",
      score: 55, // Medium range (41-60)
      severity: "medium",
    },
    {
      findingsCount: report.findingGroups?.lowCount ?? 0,
      description: "Minor issues to consider for future updates",
      score: 76, // Low range (61-80)
      severity: "low",
    },
    {
      findingsCount: report.findingGroups?.passCount ?? 0,
      description: "These areas passed our checks",
      score: 98, // Pass range (81-100)
      severity: "pass",
    },
  ];

  return (
    <div className="space-y-5 p-5">
      <ScanReportPageHeader 
        domain={report.domainName} 
        domainStatus={report.domainStatus} 
        onAskAi={() => setIsChatOpen(true)}
        onRescan={handleRescan}
        isRescanning={isRescanning}
      />
      <PageHeader
        title="Security Scan Report"
        description={
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold">Scan type: </span>
            <span className="font-semibold">{report.coverage || "Quick Scan"}</span>
            <div className="size-1.5 bg-neutral-300 rounded-full"></div>
            <span className="text-neutral-500">{formatScannedDate(report.completedAt || report.initiatedAt)}</span>
          </div>
        }
      />
      <div className="grid sm:grid-cols-[250px_1fr] gap-5">
        <SecurityScoreCard score={report.securityScore} />
        <Card>
          <div className="space-y-6">
            <h2 className="font-semibold text-[#111827] text-[18px]">
              Your Security Summary:
            </h2>
            <div className="space-y-4 font-geist font-normal text-[16px]">
              <div className="flex items-start gap-4">
                <CustomCheckIcon className="text-[#1DAF61] shrink-0 mt-0.5" />
                <p>
                  <span className="text-[#2B2B2B]">
                    Your domain has <span className="text-[#D00416] font-semibold">{criticalCount} Critical {criticalCount === 1 ? "Issue" : "Issues"}</span> that {criticalCount === 1 ? "needs" : "need"} immediate attention:
                  </span>
                  <span className="text-[#919191]">
                    {" "}{criticalText}
                  </span>
                </p>
              </div>
              <div className="flex items-start gap-4">
                <CustomCheckIcon className="text-[#1DAF61] shrink-0 mt-0.5" />
                <p>
                  <span className="text-[#2B2B2B]">
                    <span className="text-[#D00416] font-semibold">{highCount} high-severity {highCount === 1 ? "finding" : "findings"}</span> compound the risk:
                  </span>
                  <span className="text-[#919191]">
                    {" "}{highText}
                  </span>
                </p>
              </div>
              <div className="flex items-start gap-4">
                <CustomCheckIcon className="text-[#1DAF61] shrink-0 mt-0.5" />
                <p>
                  <span className="text-[#0BA352] font-semibold">The good news:</span>
                  <span className="text-[#919191]">
                    {" "}{goodNewsText}{" "}
                  </span>
                </p>
              </div>
            </div>
            <div className="hidden justify-end mt-6">
              {detailsHref ? (
                <Button
                  asChild
                  variant={"ghost"}
                  className="p-0! h-auto! flex gap-1.5 text-[#0C2B21] hover:bg-transparent text-[16px] font-medium"
                >
                  <Link href={detailsHref}>
                    View Details <ChevronRight size={18} />
                  </Link>
                </Button>
              ) : (
                <Button
                  variant={"ghost"}
                  disabled
                  className="p-0! h-auto! flex gap-1.5 text-[#9CA3AF] hover:bg-transparent text-[16px] font-medium"
                >
                  View Details <ChevronRight size={18} />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Our Findings card with View All Findings CTA */}
      <Card>
        <div className="space-y-5">
          <h2 className="font-semibold text-neutral-800">Our findings:</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {findings.map((result, idx) => (
              <FindingsItemCard
                key={idx}
                score={result.score}
                severityCount={result.findingsCount}
                description={result.description}
                href={scanId ? `/scan/report/findings?scanId=${encodeURIComponent(scanId)}&severity=${result.severity}` : undefined}
              />
            ))}
          </div>
          {/* View All Findings CTA */}
          {scanId && (
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                className="flex items-center gap-2 text-white font-semibold"
                onClick={() => router.push(`/scan/report/findings?scanId=${encodeURIComponent(scanId)}`)}
              >
                <ViewFindingsIcon />
                View all findings
              </Button>
            </div>
          )}
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <ScanReportScoreStatCard
          score={report.subScores.exposure.score}
          type="Exposure"
          description={
            report.subScores.exposure.explanation ||
            report.subScores.exposure.detail ||
            "Exposed assets and public endpoints check."
          }
          href={scanId ? `/scan/report/findings/exposure?scanId=${encodeURIComponent(scanId)}` : undefined}
        />
        <ScanReportScoreStatCard
          score={report.subScores.ssl.score}
          type="SSL"
          description={
            report.subScores.ssl.explanation ||
            report.subScores.ssl.detail ||
            "TLS/SSL configuration and cipher suite safety."
          }
          href={scanId ? `/scan/report/findings/ssl?scanId=${encodeURIComponent(scanId)}` : undefined}
        />
        <ScanReportScoreStatCard
          score={report.subScores.dns.score}
          type="DNS"
          description={
            report.subScores.dns.explanation ||
            report.subScores.dns.detail ||
            "MX, SPF, DMARC, and DNS record delegation."
          }
          href={scanId ? `/scan/report/findings/dns?scanId=${encodeURIComponent(scanId)}` : undefined}
        />
      </div>




      {/* AI Chatbot overlay */}
      {isChatOpen && (
        <AIChatbot scanId={scanId ?? ""} onClose={() => setIsChatOpen(false)} />
      )}
    </div>
  );
}

export default function ScanReportPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0BA352]" />
      </div>
    }>
      <ScanReportContent />
    </Suspense>
  );
}
