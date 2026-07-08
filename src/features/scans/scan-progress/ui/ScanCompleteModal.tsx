"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  Clock,
  ShieldCheck,
} from "lucide-react";
import ScanResultCardItem from "./ScanResultCardItem";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ScanCompleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domain?: string;
  domainId?: string;
  scanId?: string;
  duration?: string;
  passed?: number;
  failed?: number;
}

export default function ScanCompleteModal({
  open,
  onOpenChange,
  domain,
  domainId,
  scanId,
  duration,
  passed,
  failed,
}: ScanCompleteModalProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="overflow-visible sm:max-w-lg p-0 border-none shadow-none bg-transparent outline-none"
      >
        {/* Scrollable container with padding for the overlap */}
        <div className="pt-16 pb-8 overflow-y-auto max-h-[98vh] scrollbar-hide">
          {/* The actual card */}
          <div className="bg-white rounded-4xl p-6 relative overflow-visible shadow-2xl mx-4 sm:mx-0">
            <DialogHeader className="sr-only">
              <DialogTitle>Scan Complete</DialogTitle>
              <DialogDescription>
                Your security scan finished successfully. Review the findings
                below.
              </DialogDescription>
            </DialogHeader>

            <div className="relative">
              {/* Overlapping Checkmark Icon */}
              <div className="absolute top-0 translate-y-[-72%] left-1/2 translate-x-[-50%] z-10">
                <svg
                  width="120"
                  height="123"
                  viewBox="0 0 120 123"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="9.5"
                    y="2.5"
                    width="101"
                    height="101"
                    rx="50.5"
                    fill="#1DAF61"
                  />
                  <rect
                    x="9.5"
                    y="2.5"
                    width="101"
                    height="101"
                    rx="50.5"
                    stroke="white"
                    strokeWidth="5"
                  />
                  <g filter="url(#filter0_dd_6705_20453)">
                    <rect
                      x="12"
                      y="5"
                      width="96"
                      height="96"
                      rx="48"
                      fill="white"
                      fillOpacity="0.01"
                      shapeRendering="crispEdges"
                    />
                  </g>
                  <path
                    d="M78.0174 47.2035L57.9549 67.266C57.4861 67.7345 56.8505 67.9977 56.1877 67.9977C55.525 67.9977 54.8893 67.7345 54.4205 67.266L43.2299 56.016C42.7619 55.5473 42.499 54.912 42.499 54.2496C42.499 53.5873 42.7619 52.9519 43.2299 52.4832L46.3549 49.3582C46.8234 48.8916 47.4577 48.6297 48.119 48.6297C48.7802 48.6297 49.4145 48.8916 49.883 49.3582L56.2502 55.5332L71.369 40.6004C71.8376 40.1334 72.4722 39.8711 73.1338 39.8711C73.7954 39.8711 74.43 40.1334 74.8986 40.6004L78.0158 43.6535C78.2503 43.8858 78.4364 44.1623 78.5634 44.4669C78.6905 44.7714 78.756 45.0982 78.7561 45.4282C78.7563 45.7582 78.6911 46.085 78.5643 46.3897C78.4375 46.6944 78.2516 46.971 78.0174 47.2035Z"
                    fill="white"
                  />
                  <rect
                    opacity="0.5"
                    x="13"
                    y="6"
                    width="94"
                    height="94"
                    rx="47"
                    stroke="#1DAF61"
                    strokeWidth="2"
                  />
                  <defs>
                    <filter
                      id="filter0_dd_6705_20453"
                      x="0"
                      y="3"
                      width="120"
                      height="120"
                      filterUnits="userSpaceOnUse"
                      colorInterpolationFilters="sRGB"
                    >
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feMorphology
                        radius="4"
                        operator="erode"
                        in="SourceAlpha"
                        result="effect1_dropShadow_6705_20453"
                      />
                      <feOffset dy="4" />
                      <feGaussianBlur stdDeviation="3" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0.407843 0 0 0 0 0.372549 0 0 0 0.2 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="BackgroundImageFix"
                        result="effect1_dropShadow_6705_20453"
                      />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feMorphology
                        radius="3"
                        operator="erode"
                        in="SourceAlpha"
                        result="effect2_dropShadow_6705_20453"
                      />
                      <feOffset dy="10" />
                      <feGaussianBlur stdDeviation="7.5" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0.407843 0 0 0 0 0.372549 0 0 0 0.2 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="effect1_dropShadow_6705_20453"
                        result="effect2_dropShadow_6705_20453"
                      />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect2_dropShadow_6705_20453"
                        result="shape"
                      />
                    </filter>
                  </defs>
                </svg>
              </div>

              <div className="text-center pt-12 space-y-4">
                <h1 className="font-semibold text-2xl text-scan-primary-900">
                  Scan Complete
                </h1>
                <p className="font-geist font-normal text-[#2B2B2B]">
                  Your security scan {domain ? <>for <span className="font-semibold text-neutral-800">{domain}</span></> : ""} finished successfully. Review the findings below.
                </p>

                <div className="grid grid-cols-3 gap-4 justify-center">
                  <ScanResultCardItem
                    statCount={duration ?? "—"}
                    icon={<Clock size={18} />}
                    description="Duration"
                    severity="neutral"
                  />
                  <ScanResultCardItem
                    statCount={passed !== undefined ? String(passed) : "—"}
                    icon={<CheckCircleIcon size={18} />}
                    description="Passed"
                    severity="excellent"
                  />
                  <ScanResultCardItem
                    statCount={failed !== undefined ? String(failed) : "—"}
                    icon={<AlertTriangleIcon size={18} />}
                    description="Failed"
                    severity="critical"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    onClick={() =>
                      router.replace(
                        scanId
                          ? `/scan/report?scanId=${encodeURIComponent(scanId)}`
                          : "/scan/report",
                      )
                    }
                    className="w-full"
                  >
                    Show Result
                  </Button>
                  <button
                    onClick={async () => {
                      if (!domain || !domainId) {
                        router.push("/domain");
                        return;
                      }
                      try {
                        const { scanService } = await import("@/features/scans/services/scan.service");
                        const res = await scanService.createScan({
                          domainId,
                          scanType: "QUICK_SCAN",
                        });
                        if (res.isSuccess && res.value?.scanId) {
                          // Force a hard reload on the new URL to reset all states cleanly
                          window.location.href = `/scan/progress?scanId=${res.value.scanId}&domain=${encodeURIComponent(domain)}&initiatedAt=${encodeURIComponent(res.value.initiatedAt || new Date().toISOString())}`;
                        } else {
                          router.push("/domain");
                        }
                      } catch {
                        router.push("/domain");
                      }
                    }}
                    className="block w-full text-center font-geist font-normal text-[#2B2B2B] hover:underline"
                  >
                    Run another scan
                  </button>
                </div>

                <div className="mt-16 flex items-center justify-center gap-2 text-neutral-500 text-sm">
                  <ShieldCheck size={18} className="text-[#1FC16B]" />
                  <p>Verified by SecureScan Engine</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
