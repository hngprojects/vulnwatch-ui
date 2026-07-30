"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
  Loader2,
  AlertTriangle,
  ChevronRight,
  FileText,
  Globe,
  X,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { domainService } from "../services/domain.service";
import { useDomainOwnershipGuard, extractApiError } from "../hooks/useDomainOwnershipGuard";

type Step = 1 | 2 | 3 | 4;
type Platform = "hostinger" | "cpanel" | "namecheap" | "wordpress" | "shopify" | "vercel";
type VerifyResult = "success" | "failed" | null;

const STEP_LABELS = ["Setup", "Upload", "Verify", "Done"];

function FileUploadStepper({ current }: { current: Step }) {
  return (
    <div className="flex items-center">
      {STEP_LABELS.map((label, i) => {
        const stepNum = (i + 1) as Step;
        const isDone = stepNum < current;
        const isActive = stepNum === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isDone
                    ? "bg-brand-green text-white"
                    : isActive
                    ? "bg-[#072E28] text-white"
                    : "bg-[#E5E7EB] text-[#9CA3AF]"
                }`}
              >
                {isDone ? <Check size={11} /> : stepNum}
              </div>
              <span
                className={`text-xs sm:text-sm font-medium font-geist ${
                  isActive ? "text-brand-dark" : isDone ? "text-brand-green" : "text-[#9CA3AF]"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className="flex gap-0.5 mx-2 sm:mx-3">
                {[...Array(4)].map((_, j) => (
                  <div
                    key={j}
                    className={`w-1.5 h-0.5 rounded-full ${
                      stepNum < current ? "bg-brand-green" : "bg-[#D1D5DB]"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const PLATFORMS: { id: Platform; label: string }[] = [
  { id: "hostinger", label: "Hostinger" },
  { id: "cpanel", label: "cPanel" },
  { id: "namecheap", label: "Namecheap Hosting" },
  { id: "wordpress", label: "WordPress" },
  { id: "shopify", label: "Shopify" },
  { id: "vercel", label: "Vercel/Netlify" },
];

function getPlatformSteps(platform: Platform, fileName: string, accessUrl: string): string[] {
  const map: Record<Platform, string[]> = {
    hostinger: [
      "Log in to your Hostinger account at hpanel.hostinger.com.",
      "In the left sidebar, go to: Files → File Manager",
      "Open the public_html folder",
      `Click "Upload" and select the file from your Downloads: ${fileName}`,
      `Once uploaded, click this link to confirm it's working: ${accessUrl}`,
    ],
    cpanel: [
      "Log in to your cPanel account.",
      "Open the File Manager tool.",
      "Navigate to the public_html (root) directory.",
      `Upload the file ${fileName} to this folder.`,
      `Verify the file is accessible at: ${accessUrl}`,
    ],
    namecheap: [
      "Log in to your Namecheap hosting account.",
      "Go to cPanel → File Manager.",
      "Open the public_html directory.",
      `Upload ${fileName} to the root folder.`,
      `Confirm access at: ${accessUrl}`,
    ],
    wordpress: [
      "Log in to your WordPress dashboard.",
      'Install a file manager plugin (e.g. "WP File Manager").',
      "Navigate to the root of your WordPress site (same level as wp-config.php).",
      `Upload ${fileName} here — do NOT place it inside /wp-content/ or /assets/.`,
      `Verify the file is accessible at: ${accessUrl}`,
    ],
    shopify: [
      "Log in to your Shopify admin panel.",
      'Go to Online Store → Themes → Actions → "Edit code".',
      'Click "Add a new file" under the Assets folder.',
      `Name it ${fileName} and paste the file content inside.`,
      `Confirm the file is accessible at: ${accessUrl}`,
    ],
    vercel: [
      "Create a new file in your project's public/ folder.",
      `Name it ${fileName} and paste the file content inside.`,
      "Commit and push the change to trigger a new deployment.",
      `Once deployed, verify the file is accessible at: ${accessUrl}`,
    ],
  };
  return map[platform];
}

// ── Step 1: Download ──────────────────────────────────────────────────────────

function Step1Setup({
  fileName,
  fileContent,
  accessUrl,
  copied,
  onCopy,
  onDownload,
  onNext,
}: {
  fileName: string;
  fileContent: string;
  accessUrl: string;
  copied: string | null;
  onCopy: (text: string, key: string) => void;
  onDownload: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] sm:text-[28px] font-semibold text-brand-dark font-geist">
          Download Your Verification File
        </h1>
        <p className="text-sm text-brand-gray font-geist mt-1 max-w-xl">
          We&apos;ve generated a unique file for your domain. Upload it to your website
          and we&apos;ll confirm you&apos;re the owner — it takes about 3 minutes
        </p>
      </div>

      {/* How it works */}
      <div>
        <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3 font-geist">
          HOW IT WORKS
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { step: "Step 1.", label: "Download the file", icon: <Download size={20} className="text-brand-dark" /> },
            { step: "Step 2.", label: "Upload to your website", icon: <Globe size={20} className="text-brand-dark" /> },
            { step: "Step 3.", label: "We check & verify", icon: <Check size={20} className="text-brand-green" /> },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-row sm:flex-col items-center sm:items-center gap-3 sm:gap-2 p-4 bg-white rounded-lg border border-[#E5E7EB] text-center"
            >
              <div className="w-8 h-8 flex items-center justify-center shrink-0">{item.icon}</div>
              <div className="sm:text-center">
                <p className="text-xs text-[#9CA3AF] font-geist">{item.step}</p>
                <p className="text-sm font-medium text-brand-dark font-geist">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* File details + Where it should go */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 space-y-4">
          <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider font-geist">
            FILE DETAILS
          </p>
          <div className="flex items-center gap-2.5">
            <FileText size={15} className="text-brand-dark shrink-0" />
            <span className="text-sm font-medium text-brand-dark font-geist">{fileName}</span>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF] mb-1.5 font-geist">File content</p>
            <div className="flex items-center gap-2 bg-[#F3F4F6] rounded-md px-3 py-2">
              <span className="text-xs text-brand-dark font-mono flex-1 truncate">{fileContent}</span>
              <button
                onClick={() => onCopy(fileContent, "content")}
                className="shrink-0 flex items-center gap-1 text-xs text-[#072E28] font-medium hover:opacity-75 transition-opacity cursor-pointer"
              >
                {copied === "content" ? <Check size={12} /> : <Copy size={12} />}
                {copied === "content" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <p className="text-xs text-[#9CA3AF] font-geist">
            This file is unique to your domain and expires in 72 hours
          </p>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 space-y-4">
          <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider font-geist">
            WHERE IT SHOULD GO
          </p>
          <p className="text-sm text-brand-gray font-geist">
            After uploading, your file should be accessible here:
          </p>
          <div className="flex items-center gap-2 bg-[#F3F4F6] rounded-md px-3 py-2">
            <span className="text-xs text-brand-dark font-mono flex-1 truncate">{accessUrl}</span>
            <button
              onClick={() => onCopy(accessUrl, "accessUrl")}
              className="shrink-0 flex items-center gap-1 text-xs text-[#072E28] font-medium hover:opacity-75 transition-opacity cursor-pointer"
            >
              {copied === "accessUrl" ? <Check size={12} /> : <Copy size={12} />}
              {copied === "accessUrl" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <Button
          onClick={onDownload}
          className="bg-[#072E28] hover:bg-[#072E28]/90 text-white font-medium h-11 px-6 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download size={16} />
          Download verification file
        </Button>
        <Button
          onClick={onNext}
          variant="outline"
          className="h-11 px-6 rounded-lg border-[#072E28] text-[#072E28] font-medium flex items-center justify-center gap-2 cursor-pointer"
        >
          I have downloaded it
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}

// ── Step 2: Upload ────────────────────────────────────────────────────────────

function Step2Upload({
  platform,
  setPlatform,
  platformSteps,
  accessUrl,
  copied,
  onCopyDevInstructions,
  onBack,
  onVerify,
}: {
  platform: Platform;
  setPlatform: (p: Platform) => void;
  platformSteps: string[];
  accessUrl: string;
  copied: string | null;
  onCopyDevInstructions: () => void;
  onBack: () => void;
  onVerify: () => void;
}) {
  const platformLabel = PLATFORMS.find((p) => p.id === platform)?.label ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] sm:text-[28px] font-semibold text-brand-dark font-geist">
          Upload the File to Your Website
        </h1>
        <p className="text-sm text-brand-gray font-geist mt-1">
          Place the file in the root (main) folder of your website so we can access it publicly.
        </p>
      </div>

      {/* Platform tabs */}
      <div>
        <p className="text-sm font-medium text-brand-dark mb-3 font-geist">
          How is your website hosted?
        </p>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer font-geist ${
                platform === p.id
                  ? "bg-[#072E28] text-white"
                  : "bg-white border border-[#E5E7EB] text-brand-dark hover:border-[#072E28]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-brand-green font-geist">
          Can&apos;t find yours? See all Platforms
        </p>
      </div>

      {/* Platform-specific instructions */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[4px] bg-[#072E28] flex items-center justify-center shrink-0">
            <span className="text-white text-[11px] font-bold font-geist">
              {platformLabel.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-semibold text-brand-dark uppercase tracking-wide font-geist">
            {platformLabel}
          </span>
        </div>
        <ol className="space-y-3">
          {platformSteps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-[#F3F4F6] flex items-center justify-center text-xs font-semibold text-brand-dark shrink-0 mt-0.5 font-geist">
                {i + 1}
              </div>
              <p className="text-sm text-brand-dark font-geist leading-relaxed">{s}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Where it should go + Having problems */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#F0FDF4] rounded-lg border border-[#BBF7D0] p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-[#15803D] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider font-geist mb-1">
                WHERE IT SHOULD GO
              </p>
              <p className="text-xs text-[#15803D] font-geist leading-relaxed">
                The file must go in the root folder — NOT inside any subfolder like
                /wp-content/ or /assets/. It must be reachable at the URL shown above.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 space-y-3">
          <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wider font-semibold font-geist">
            HAVING PROBLEMS?
          </p>
          <p className="text-sm text-brand-gray font-geist">
            Not sure? Your developer can do this in under 2 minutes.
          </p>
          <button
            onClick={onCopyDevInstructions}
            className="flex items-center gap-1.5 text-xs font-medium text-[#072E28] border border-[#072E28] rounded-md px-3 py-1.5 hover:bg-[#072E28]/5 transition-colors cursor-pointer font-geist"
          >
            {copied === "dev" ? <Check size={12} /> : <Copy size={12} />}
            {copied === "dev" ? "Copied!" : "Copy instructions for your developer"}
          </button>
        </div>
      </div>

      {/* Access URL reminder */}
      <div className="flex items-start gap-2 bg-[#F3F4F6] rounded-lg px-4 py-3">
        <AlertTriangle size={14} className="text-[#6B7280] shrink-0 mt-0.5" />
        <p className="text-xs text-[#6B7280] font-geist">
          Your file should be accessible at:{" "}
          <span className="font-mono text-brand-dark">{accessUrl}</span>
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] transition-colors font-geist"
        >
          <ArrowLeft size={16} />
          Choose a different method
        </button>
        <Button
          onClick={onVerify}
          className="bg-[#072E28] hover:bg-[#072E28]/90 text-white font-medium h-11 px-6 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          I&apos;ve uploaded the file — Verify now
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}

// ── Step 3: Checking ──────────────────────────────────────────────────────────

function Step3Checking({
  domainName,
  fileName,
  checkProgress,
}: {
  domainName: string;
  fileName: string;
  checkProgress: number;
}) {
  const checks = [
    `Connecting to ${domainName}`,
    `Looking for ${fileName} ...`,
    "Confirming file content",
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 py-8">
      <div className="w-20 h-20 rounded-full border-4 border-[#E5E7EB] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#072E28]" />
      </div>

      <div className="text-center">
        <h2 className="text-[24px] font-semibold text-brand-dark font-geist">
          Checking your file...
        </h2>
        <p className="text-sm text-brand-gray font-geist mt-1">
          We&apos;re visiting {domainName} to confirm the verification file is in place.
        </p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-lg border border-[#E5E7EB] divide-y divide-[#F3F4F6]">
        {checks.map((label, i) => {
          const done = checkProgress > i;
          const active = checkProgress === i;
          return (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              {done ? (
                <div className="w-5 h-5 rounded-full bg-brand-green flex items-center justify-center shrink-0">
                  <Check size={11} className="text-white" />
                </div>
              ) : active ? (
                <Loader2 size={16} className="animate-spin text-[#072E28] shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-[#D1D5DB] shrink-0" />
              )}
              <span className="text-sm text-brand-dark font-geist">{label}</span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#9CA3AF] font-geist">This usually takes less than 30 seconds</p>

      <div className="text-center space-y-1">
        <p className="text-sm text-brand-gray font-geist">
          Taking too long? We&apos;ll mail you when it&apos;s done
        </p>
        <button className="text-sm text-brand-green underline font-geist cursor-pointer">
          Notify me by email instead
        </button>
      </div>

      <div className="flex items-center gap-2 bg-[#F9FAFB] rounded-lg px-4 py-3 text-xs text-[#6B7280] font-geist max-w-sm w-full justify-center">
        <Lock size={12} className="text-brand-green shrink-0" />
        We&apos;re only reading your file — we&apos;re not modifying anything on your website.
      </div>
    </div>
  );
}

// ── Step 4: Success ───────────────────────────────────────────────────────────

function Step4Success({
  domainName,
  fileName,
  onScan,
  onAddDomain,
  onDashboard,
}: {
  domainName: string;
  fileName: string;
  onScan: () => void;
  onAddDomain: () => void;
  onDashboard: () => void;
}) {
  const now = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 py-8">
      <div className="w-16 h-16 rounded-full bg-brand-green flex items-center justify-center">
        <Check size={30} className="text-white" />
      </div>

      <div className="text-center">
        <h2 className="text-[24px] font-semibold font-geist">
          <span className="text-[#7C3AED]">{domainName}</span>{" "}
          <span className="text-brand-dark">is verified</span>
        </h2>
        <p className="text-sm text-brand-gray font-geist mt-1 max-w-sm mx-auto">
          You&apos;ve confirmed ownership of your domain. VulnWatch AI can now safely
          scan your external attack surface.
        </p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
        <div className="px-4 py-2 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider font-geist">
          VERIFICATION SUMMARY
        </div>
        {[
          {
            icon: <Check size={11} className="text-white" />,
            iconBg: "bg-brand-green",
            text: domainName,
          },
          {
            icon: <Check size={11} className="text-white" />,
            iconBg: "bg-brand-green",
            text: "Verified via file upload",
          },
          {
            icon: <span className="text-[9px]">📅</span>,
            iconBg: "bg-[#F3F4F6]",
            text: `Verified on ${now}`,
          },
          {
            icon: <FileText size={11} className="text-[#6B7280]" />,
            iconBg: "bg-[#F3F4F6]",
            text: fileName,
          },
        ].map((row, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-2.5 border-t border-[#F3F4F6]"
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${row.iconBg}`}
            >
              {row.icon}
            </div>
            <span className="text-sm text-brand-dark font-geist">{row.text}</span>
          </div>
        ))}
      </div>

      <div className="w-full max-w-sm space-y-3">
        <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider font-geist">
          WHAT&apos;S NEXT
        </p>
        <p className="text-sm text-brand-gray font-geist">
          Now that your domain is verified, run your first security scan to see your
          security health score and any issues we find.
        </p>
        <Button
          onClick={onScan}
          className="w-full bg-[#072E28] hover:bg-[#072E28]/90 text-white h-11 rounded-lg flex items-center justify-center gap-2 font-medium cursor-pointer"
        >
          Run my first scan
        </Button>
        <div className="flex gap-3">
          <Button
            onClick={onAddDomain}
            variant="outline"
            className="flex-1 h-10 rounded-lg text-sm cursor-pointer"
          >
            Add another domain
          </Button>
          <Button
            onClick={onDashboard}
            variant="outline"
            className="flex-1 h-10 rounded-lg text-sm cursor-pointer"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Step 4: Failed ────────────────────────────────────────────────────────────

function Step4Failed({
  accessUrl,
  onGoBack,
  onTryDifferent,
  onTryAgain,
}: {
  accessUrl: string;
  onGoBack: () => void;
  onTryDifferent: () => void;
  onTryAgain: () => void;
}) {
  const REASONS = [
    {
      title: "The file is in the wrong folder",
      desc: "The file needs to be in the root (main) folder of your website, not inside /wp-content/, /images/, /assets/, or any other subfolder.",
    },
    { title: "The file was renamed during upload", desc: "" },
    { title: "The file isn't publicly accessible", desc: "" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 py-8">
      <div className="w-16 h-16 rounded-full bg-[#FEF2F2] flex items-center justify-center">
        <AlertTriangle size={28} className="text-[#EF4444]" />
      </div>

      <div className="text-center">
        <h2 className="text-[24px] font-semibold text-brand-dark font-geist">
          We couldn&apos;t verify your file
        </h2>
        <p className="text-sm text-brand-gray font-geist mt-1 max-w-sm mx-auto">
          We checked for your verification file but couldn&apos;t confirm it&apos;s in
          the right place. Don&apos;t worry — this is easy to fix
        </p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-lg border border-[#E5E7EB] p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-brand-dark font-geist">
          <span className="shrink-0">We checked:</span>
          <a
            href={accessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-green underline truncate"
          >
            {accessUrl}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#FEF2F2] flex items-center justify-center shrink-0">
            <X size={11} className="text-[#EF4444]" />
          </div>
          <span className="text-sm text-brand-dark font-geist">
            Result: File not found (HTTP 404)
          </span>
        </div>
        <a
          href={accessUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-brand-green underline font-geist"
        >
          Check this URL yourself
          <ChevronRight size={12} />
        </a>
      </div>

      <div className="w-full max-w-sm space-y-2">
        <p className="text-sm font-semibold text-brand-dark font-geist">MOST LIKELY REASONS</p>
        {REASONS.map((r, i) => (
          <div key={i} className="flex items-start gap-2">
            <ChevronRight size={14} className="text-brand-dark shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-brand-dark font-geist">{r.title}</p>
              {r.desc && (
                <p className="text-xs text-brand-gray font-geist">{r.desc}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="w-full max-w-sm flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onGoBack}
          className="flex-1 bg-[#072E28] hover:bg-[#072E28]/90 text-white h-11 rounded-lg font-medium cursor-pointer"
        >
          Go back and fix upload
        </Button>
        <Button
          onClick={onTryDifferent}
          variant="outline"
          className="flex-1 h-11 rounded-lg font-medium cursor-pointer"
        >
          Try a different method
        </Button>
      </div>

      <button
        onClick={onTryAgain}
        className="text-sm text-brand-green underline font-geist cursor-pointer"
      >
        Try verifying again
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function VerifyFileUploadPage({ domainId }: { domainId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const { domain, loading: loadingDomain, authorized, error } = useDomainOwnershipGuard(domainId);
  const [step, setStep] = useState<Step>(1);
  const [platform, setPlatform] = useState<Platform>("hostinger");
  const [verifyResult, setVerifyResult] = useState<VerifyResult>(null);
  const [checkProgress, setCheckProgress] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (authorized === false) {
      toast.error("Unauthorized to access this domain");
      router.push("/domain");
    } else if (error) {
      toast.error(error);
      router.push("/domain");
    }
  }, [authorized, error, router]);

  const domainName = domain?.domain ?? "yourdomain.com";
  const tokenShort = tokenFromUrl.slice(0, 8) || "verify";
  const fileName = `vulnwatch-verify-${tokenShort}.txt`;
  const fileContent = `vulnwatch-verification=${tokenFromUrl || "token"}`;
  const accessUrl = `https://${domainName}/${fileName}`;

  const onCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const onDownload = () => {
    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Verification file downloaded!");
  };

  const onCopyDevInstructions = () => {
    const steps = getPlatformSteps(platform, fileName, accessUrl);
    const text = [
      "VulnWatch Domain Verification Instructions",
      `Domain: ${domainName}`,
      `File: ${fileName}`,
      `Upload URL: ${accessUrl}`,
      "",
      "Steps:",
      ...steps.map((s, i) => `${i + 1}. ${s}`),
    ].join("\n");
    onCopy(text, "dev");
    toast.success("Instructions copied for your developer!");
  };

  const handleVerify = async () => {
    setStep(3);
    setCheckProgress(0);

    const t1 = setTimeout(() => setCheckProgress(1), 900);
    const t2 = setTimeout(() => setCheckProgress(2), 1900);

    try {
      await domainService.verifyDomain(domainId);
      clearTimeout(t1);
      clearTimeout(t2);
      setCheckProgress(3);
      setTimeout(() => {
        setVerifyResult("success");
        setStep(4);
      }, 700);
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      setCheckProgress(3);
      const msg = extractApiError(err);
      setTimeout(() => {
        setVerifyResult("failed");
        setStep(4);
        toast.error(msg);
      }, 700);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      router.push(
        `/domain/${domainId}/verify?token=${encodeURIComponent(tokenFromUrl)}`
      );
    } else if (step === 2) {
      setStep(1);
    } else if (step === 3 || step === 4) {
      setStep(2);
    }
  };

  if (loadingDomain) {
    return (
      <div className="px-4 md:px-6 py-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin text-[#072E28]" />
      </div>
    );
  }

  const platformSteps = getPlatformSteps(platform, fileName, accessUrl);

  return (
    <div className="px-4 md:px-6 py-6 bg-[#F9FAFB] min-h-screen">
      {/* Top nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] transition-colors self-start"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <nav className="hidden sm:flex items-center gap-1 text-xs text-[#6B7280] font-geist">
          <span>Domain</span>
          <ChevronRight size={11} />
          <span>Verify Domain</span>
          <ChevronRight size={11} />
          <span className="text-brand-dark font-medium">File Verification Setup</span>
        </nav>
      </div>

      {/* Stepper */}
      <div className="flex justify-center mb-6 overflow-x-auto pb-1">
        <FileUploadStepper current={step} />
      </div>

      {/* Domain badges */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] rounded-full bg-white text-sm text-brand-dark font-geist">
          <Globe size={13} className="text-brand-green" />
          {domainName}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] rounded-full bg-white text-sm text-brand-dark font-geist">
          <FileText size={13} className="text-brand-dark" />
          Method: File Upload
        </div>
      </div>

      {/* Step content */}
      {step === 1 && (
        <Step1Setup
          fileName={fileName}
          fileContent={fileContent}
          accessUrl={accessUrl}
          copied={copied}
          onCopy={onCopy}
          onDownload={onDownload}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <Step2Upload
          platform={platform}
          setPlatform={setPlatform}
          platformSteps={platformSteps}
          accessUrl={accessUrl}
          copied={copied}
          onCopyDevInstructions={onCopyDevInstructions}
          onBack={() => setStep(1)}
          onVerify={handleVerify}
        />
      )}
      {step === 3 && (
        <Step3Checking
          domainName={domainName}
          fileName={fileName}
          checkProgress={checkProgress}
        />
      )}
      {step === 4 && verifyResult === "success" && (
        <Step4Success
          domainName={domainName}
          fileName={fileName}
          onScan={() => router.push("/scan")}
          onAddDomain={() => router.push("/domain")}
          onDashboard={() => router.push("/domain")}
        />
      )}
      {step === 4 && verifyResult === "failed" && (
        <Step4Failed
          accessUrl={accessUrl}
          onGoBack={() => setStep(2)}
          onTryDifferent={() =>
            router.push(
              `/domain/${domainId}/verify?token=${encodeURIComponent(tokenFromUrl)}`
            )
          }
          onTryAgain={handleVerify}
        />
      )}
    </div>
  );
}
