"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleAlert, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDomainOwnershipGuard } from "../hooks/useDomainOwnershipGuard";
import DomainVerificationStepper from "./DomainVerificationStepper";

const LINK_EXPIRY_SECONDS = 5 * 60;

function getDefaultEmail(domainName: string) {
  if (!domainName) return "admin@company.io";
  return `admin@${domainName}`;
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

export default function VerifyEmailWaitingPage({
  domainId,
}: {
  domainId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const emailParam = searchParams.get("email");
  const { domain, loading, authorized, error } = useDomainOwnershipGuard(domainId);
  const [countdown, setCountdown] = useState(LINK_EXPIRY_SECONDS);

  useEffect(() => {
    if (authorized === false) {
      toast.error("Unauthorized to access this domain");
      router.push("/domain");
    } else if (error) {
      toast.error(error);
      router.push("/domain");
    }
  }, [authorized, error, router]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const verificationEmail = useMemo(() => {
    if (emailParam) return emailParam;
    return getDefaultEmail(domain?.domain ?? "");
  }, [domain?.domain, emailParam]);

  const handleResend = () => {
    setCountdown(LINK_EXPIRY_SECONDS);
    toast.success("Verification email resent.", {
      description: `A fresh verification link was sent to ${verificationEmail}.`,
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-6 md:px-6">
        <Loader2 size={24} className="animate-spin text-[#072E28]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-6 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <DomainVerificationStepper
            steps={[
              {
                number: 1,
                label: "Domain Info",
                mobileLabel: "Domain info",
                state: "complete",
              },
              {
                number: 2,
                label: "Verification Method",
                mobileLabel: "Verification Method",
                state: "complete",
              },
              {
                number: 3,
                label: "Select Email",
                mobileLabel: "Select Email",
                state: "current",
              },
            ]}
          />
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-[640px] rounded-[22px] border border-[#E8E2D7] bg-white px-5 py-8 shadow-[0_14px_34px_rgba(15,23,42,0.06)] sm:px-8">
            <div className="mx-auto max-w-[420px] text-center">
              <h1 className="text-[26px] font-semibold text-[#525252] sm:text-[28px]">
                Waiting for Verification
              </h1>
              <p className="mt-3 text-base leading-7 text-[#747474]">
                We&apos;ve sent a secure verification link to your primary
                administrator email address.
              </p>
            </div>

            <div className="mx-auto mt-7 flex h-20 w-20 items-center justify-center rounded-full bg-[#E7E4D9] text-[#173C38]">
              <MailCheck size={34} />
            </div>

            <div className="mt-5 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#6C8D84] bg-[#FFFDEA] px-4 py-1.5 text-sm font-medium text-[#35564B]">
                <MailCheck size={14} />
                <span>{verificationEmail}</span>
              </div>
            </div>

            <div className="mt-7 text-center">
              <p className="text-[40px] font-semibold leading-none text-[#FF3D3D] sm:text-[46px]">
                {formatCountdown(countdown)} remaining
              </p>
              <p className="mt-2 text-sm text-[#A3A3A3]">Link expires in 5 mins</p>
            </div>

            <div className="mx-auto mt-6 max-w-[470px] rounded-[12px] border border-[#C9D8FF] bg-[#F3F7FF] px-4 py-3 text-left">
              <div className="flex items-start gap-3">
                <CircleAlert size={18} className="mt-0.5 shrink-0 text-[#5D87E1]" />
                <p className="text-sm leading-6 text-[#4D6AC8]">
                  Checking your inbox? Don&apos;t forget to check your spam or junk
                  folder if the link hasn&apos;t arrived within 2 minutes.
                </p>
              </div>
            </div>

            <div className="mx-auto mt-6 max-w-[470px]">
              <Button
                type="button"
                onClick={handleResend}
                variant="outline"
                className="h-12 w-full rounded-xl border-[#E7E7E7] bg-white text-base font-medium text-[#B4B4B4] hover:bg-[#FAFAFA] hover:text-[#6B7280]"
              >
                Resend email
              </Button>
            </div>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/domain/${domainId}/verify?token=${encodeURIComponent(token)}`,
                  )
                }
                className="text-base font-medium text-[#6B6B6B] transition-colors hover:text-[#2B2B2B]"
              >
                Switch verification method
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-[520px] text-center text-[11px] leading-4.5 text-[#8D8D8D] sm:text-xs">
          VulnWatch AI uses enterprise-grade encryption to protect your domain
          assets. Verification ensures only authorized administrators can
          trigger advanced vulnerability scans.
        </div>
      </div>
    </div>
  );
}
