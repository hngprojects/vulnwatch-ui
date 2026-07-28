"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { domainService } from "../services/domain.service";
import { useDomainOwnershipGuard, extractApiError } from "../hooks/useDomainOwnershipGuard";

const steps = [
  {
    title: "Login your domain provider",
    desc: "Go to the account where your domain is manage",
  },
  {
    title: "Open DNS settings",
    desc: "Find the DNS management or zone editor section",
  },
  {
    title: "Add a new TXT record",
    desc: "Create a new TXT record with details shown on the right",
  },
  {
    title: "Save your changes",
    desc: "DNS changes may take a few minutes to apply",
  },
];

export default function VerifyDnsPage({ domainId }: { domainId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const { domain, loading: loadingDomain, authorized, error } = useDomainOwnershipGuard(domainId);
  const [verifying, setVerifying] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (authorized === false) {
      toast.error("Unauthorized to access this domain");
      router.push("/domain");
    } else if (error) {
      toast.error(error);
      router.push("/domain");
    }
  }, [authorized, error, router]);

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      toast.success(`${field === "all" ? "All TXT details" : "Copied"} to clipboard!`);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await domainService.verifyDomain(domainId);
      toast.success("Domain verification initiated. DNS changes may take up to 1 hour.");
      router.push("/domain");
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setVerifying(false);
    }
  };

  if (loadingDomain) {
    return (
      <div className="px-4 md:px-6 py-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin text-[#072E28]" />
      </div>
    );
  }

  const token = tokenFromUrl || domain?.verificationToken || domain?.domain || "";
  const rawHost = domain?.txtRecord || domain?.instructions?.txtRecord || "_vulnwatch-verify";
  const domainName = domain?.domain || "";
  const host = (domainName && rawHost.endsWith(`.${domainName}`))
    ? rawHost.slice(0, -(domainName.length + 1))
    : rawHost;

  return (
    <div className="px-4 md:px-6 py-6 w-full bg-white min-h-screen space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.push(`/domain/${domainId}/verify?token=${encodeURIComponent(tokenFromUrl)}`)}
          className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* Header section with title and Verify button */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full">
        <div className="space-y-1">
          <h1 className="text-[20px] sm:text-[32px] font-semibold text-brand-dark font-geist leading-tight">
            Verify via DNS TXT Record
          </h1>
          <p className="text-[12px] sm:text-[16px] font-light text-brand-slate font-geist">
            Add the follow TXT record to your domain DNS settings to verify ownership
          </p>
        </div>
        <Button
          onClick={handleVerify}
          disabled={verifying}
          className="bg-[#072E28] hover:bg-[#072E28]/90 text-white font-medium h-11 px-6 rounded-[8px] shrink-0 self-start sm:self-auto cursor-pointer hidden sm:inline-flex"
        >
          {verifying ? "Verifying..." : "Verify domain"}
        </Button>
      </div>

      {/* Top Banner Message */}
      <div className="bg-brand-light-gray rounded-[12px] p-4 flex items-center gap-3">
        <Info size={24} className="text-brand-slate shrink-0" />
        <p className="text-[14px] font-medium text-brand-dark font-geist leading-relaxed">
          This tell us that you own the domain by proving you can update the DNS settings
        </p>
      </div>

      {/* Two Column Layout: Steps vs Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Steps to verify */}
        <div className="lg:col-span-5 space-y-5">
          <h3 className="text-[24px] font-semibold text-brand-dark font-geist">
            Steps to verify
          </h3>
          <ol className="space-y-6">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-[13px] font-semibold text-gray-400 shrink-0 mt-0.5 font-geist">
                  {i + 1}
                </div>
                <div className="space-y-1">
                  <p className="text-[16px] font-medium text-brand-dark font-geist">
                    {s.title}
                  </p>
                  <p className="text-[12px] font-normal text-brand-gray font-geist leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Right column: TXT Record Details Card & Warning Block */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-[8px] border border-[#E5E7EB] overflow-hidden">
            {/* Details header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-brand-medium-gray border-b border-[#E5E7EB]">
              <span className="text-[16px] font-semibold text-brand-dark font-geist">
                TXT Record Details
              </span>
              <button
                onClick={() =>
                  copy(`Type: TXT\nHost/Name: ${host}\nValue: ${token}\nTTL: Auto`, "all")
                }
                className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#EDEDED] rounded-[8px] hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {copiedField === "all" ? (
                  <>
                    <Check size={14} className="text-brand-green" />
                    <span className="text-[12px] font-normal text-brand-green font-geist">Copied all!</span>
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.334 8.93464V10.9346C11.334 13.6013 10.2673 14.668 7.60065 14.668H5.06732C2.40065 14.668 1.33398 13.6013 1.33398 10.9346V8.4013C1.33398 5.73464 2.40065 4.66797 5.06732 4.66797H7.06732" stroke="#072E28" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M11.3331 8.93464H9.19974C7.59974 8.93464 7.06641 8.4013 7.06641 6.8013V4.66797L11.3331 8.93464Z" stroke="#072E28" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M7.7334 1.33203H10.4001" stroke="#072E28" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M4.66602 3.33203C4.66602 2.22536 5.55935 1.33203 6.66602 1.33203H8.41268" stroke="#072E28" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M14.6663 5.33203V9.4587C14.6663 10.492 13.8263 11.332 12.793 11.332" stroke="#072E28" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M14.666 5.33203H12.666C11.166 5.33203 10.666 4.83203 10.666 3.33203V1.33203L14.666 5.33203Z" stroke="#072E28" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span className="text-[12px] font-normal text-[#072E28] font-geist">Copy all</span>
                  </>
                )}
              </button>
            </div>

            {/* Details Rows (No borders) */}
            <div className="flex flex-col gap-4 py-4 px-5 bg-white">
              {/* Type */}
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-semibold text-brand-dark font-geist">
                  Type
                </span>
                <span className="text-[16px] font-medium text-brand-dark font-geist">
                  TXT
                </span>
              </div>
              {/* Host/Name */}
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-light text-brand-dark font-geist">
                  Host/Name
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-normal text-brand-dark font-geist">
                    {host}
                  </span>
                  <button
                    onClick={() => copy(host, "Host/Name")}
                    className="hover:opacity-85 transition-opacity cursor-pointer"
                  >
                    {copiedField === "Host/Name" ? (
                      <Check size={16} className="text-brand-green" />
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.499 9.62004V12.0201C12.499 15.2201 11.2191 16.5001 8.0194 16.5001H4.97964C1.7799 16.5001 0.5 15.2201 0.5 12.0201V8.98004C0.5 5.78001 1.7799 4.5 4.97964 4.5H7.37945" stroke="#2B2B2B" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12.4985 9.62004H9.9387C8.01885 9.62004 7.37891 8.98004 7.37891 7.06002V4.5L12.4985 9.62004Z" stroke="#2B2B2B" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8.17969 0.5H11.3794" stroke="#2B2B2B" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M4.50098 2.90002C4.50098 1.57201 5.57289 0.5 6.90079 0.5H8.99662" stroke="#2B2B2B" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16.4998 5.30078V10.2528C16.4998 11.4928 15.4919 12.5008 14.252 12.5008" stroke="#2B2B2B" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16.4998 5.30004H14.1C12.3001 5.30004 11.7002 4.70004 11.7002 2.90002V0.5L16.4998 5.30004Z" stroke="#2B2B2B" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {/* Value/Content */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-[16px] font-light text-brand-dark font-geist shrink-0">
                  Value/Content
                </span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[16px] font-normal text-brand-dark font-geist break-all text-right">
                    {token}
                  </span>
                  <button
                    onClick={() => copy(token, "Value/Content")}
                    className="hover:opacity-85 transition-opacity shrink-0 cursor-pointer"
                  >
                    {copiedField === "Value/Content" ? (
                      <Check size={16} className="text-brand-green" />
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.499 9.62004V12.0201C12.499 15.2201 11.2191 16.5001 8.0194 16.5001H4.97964C1.7799 16.5001 0.5 15.2201 0.5 12.0201V8.98004C0.5 5.78001 1.7799 4.5 4.97964 4.5H7.37945" stroke="#2B2B2B" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12.4985 9.62004H9.9387C8.01885 9.62004 7.37891 8.98004 7.37891 7.06002V4.5L12.4985 9.62004Z" stroke="#2B2B2B" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8.17969 0.5H11.3794" stroke="#2B2B2B" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M4.50098 2.90002C4.50098 1.57201 5.57289 0.5 6.90079 0.5H8.99662" stroke="#2B2B2B" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16.4998 5.30078V10.2528C16.4998 11.4928 15.4919 12.5008 14.252 12.5008" stroke="#2B2B2B" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16.4998 5.30004H14.1C12.3001 5.30004 11.7002 4.70004 11.7002 2.90002V0.5L16.4998 5.30004Z" stroke="#2B2B2B" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {/* TTL */}
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-light text-brand-dark font-geist">
                  TTL
                </span>
                <span className="text-[16px] font-semibold text-brand-dark font-geist">
                  Auto
                </span>
              </div>
            </div>
          </div>

          {/* Alert / Warning banner */}
          <div className="rounded-[8px] bg-[#FFEDD1] p-4 flex items-start gap-3">
            <AlertTriangle size={18} className="text-[#FFA468] shrink-0 mt-0.5" />
            <p className="text-[16px] font-normal text-brand-dark font-geist leading-relaxed">
              If DNS provider requires TTL, you can keep it at auto or use 1 hour.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Info Banner */}
      <div className="bg-brand-light-gray rounded-[12px] p-5 flex items-center gap-3.5">
        <Info size={20} className="text-[#292D32] shrink-0" />
        <div className="space-y-1">
          <p className="text-[14px] font-medium text-brand-dark font-geist leading-tight">
            Once you click you&apos;ve added the TXT record, click verify domain
          </p>
          <p className="text-[12px] font-normal text-brand-gray font-geist leading-relaxed">
            If you can&apos;t find your record yet, you can try again. DNS changes can take up to 1hour to propagate
          </p>
        </div>
      </div>

      {/* Bottom mobile verify button */}
      <div className="sm:hidden w-full pt-4">
        <Button
          onClick={handleVerify}
          disabled={verifying}
          className="bg-[#072E28] hover:bg-[#072E28]/90 text-white font-medium h-11 w-full rounded-[8px] cursor-pointer"
        >
          {verifying ? "Verifying..." : "Verify domain"}
        </Button>
      </div>
    </div>
  );
}
