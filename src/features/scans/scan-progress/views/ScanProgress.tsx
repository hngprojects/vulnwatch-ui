"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/features/scans/shared/ui/PageHeader";
import { Shield, Info } from "lucide-react";
import ProgressItem from "../ui/ProgressItem/ProgressItem";
import { SCAN_PROGRESS } from "../lib/constants";
import ScanningProgress from "../../shared/ui/ScanningProgress";
import ScanCompleteModal from "../ui/ScanCompleteModal";
import { useSearchParams } from "next/navigation";
import { useScanProgress } from "../lib/useScanProgress";

interface ScanProgressProps {
  scanId?: string;
}

export default function ScanProgress({ scanId }: ScanProgressProps) {
  const searchParams = useSearchParams();
  const domain = searchParams.get("domain") || "";
  const activeScanId = scanId || searchParams.get("scanId") || "";
  const initiatedAt = searchParams.get("initiatedAt") || "";

  const { stepStatuses, scanResult, isCompleted, isFailed } = useScanProgress(
    activeScanId || undefined,
    initiatedAt || undefined
  );

  const [showModal, setShowModal] = useState(false);

  // Delay the modal to let the 100% circle animation finish visually and let the user see the completed state
  useEffect(() => {
    if (isCompleted) {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isCompleted]);

  return (
    <>
      <div className="px-4 md:px-6 py-6">
        <PageHeader
          title="Scan Progress"
          description={
            <div className="space-y-2">
              <p className="text-neutral-600 text-sm flex items-center gap-2">
                <Shield size={18} />
                Please wait while we analyze {domain ? <span className="font-semibold text-neutral-800">{domain}</span> : "your website"}
              </p>
              <p className="text-neutral-500 text-xs flex items-center gap-1.5 bg-neutral-50 border border-neutral-100 p-2.5 rounded-lg max-w-xl">
                <Info size={14} className="text-neutral-400 shrink-0" />
                Your security scan runs in the background. It is safe to close or navigate away, but keeping this tab open will let you view the results immediately.
              </p>
            </div>
          }
          className="mb-12"
        />
        <div className="grid lg:grid-cols-2 gap-10 w-full items-start">
          <div className="flex justify-center mb-12">
            <ScanningProgress isCompleted={isCompleted} isFailed={isFailed} />
          </div>
          <div className="flex justify-center">
            {/* scan sections */}
            <div className="w-full">
              {SCAN_PROGRESS.map((item, index: number) => (
                <ProgressItem
                  key={index}
                  title={item.title}
                  description={item.description}
                  status={stepStatuses[index] || "pending"}
                  icon={item.icon}
                  isFirst={index === 0}
                  isLast={index === SCAN_PROGRESS.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <ScanCompleteModal
        open={showModal}
        onOpenChange={() => {}} // Modal is kept open until user interacts
        domain={domain}
        scanId={activeScanId || undefined}
        duration={scanResult?.duration}
        passed={scanResult?.passedCount}
        failed={scanResult?.failedCount}
      />
    </>
  );
}

