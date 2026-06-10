"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { domainService } from "../services/domain.service";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// 1. Zod Schema for strict domain validation
const domainSchema = z
  .string()
  .min(3, "Domain is too short")
  .max(253, "Domain is too long")
  .regex(
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i,
    "Enter a valid domain format (e.g. example.com)"
  );

// 2. High-security Sanitization
function sanitizeDomain(input: string): string {
  let clean = input.trim().toLowerCase();
  if (!clean) return "";

  // Force a protocol so the URL parser can extract the hostname reliably
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = "https://" + clean;
  }

  try {
    const url = new URL(clean);
    let hostname = url.hostname;
    // Strip "www." prefix if present
    if (hostname.startsWith("www.")) {
      hostname = hostname.replace("www.", "");
    }
    return hostname;
  } catch {
    // Fallback if the URL parser completely fails
    return input.trim().toLowerCase();
  }
}

function extractApiError(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const res = (err as { response?: { data?: unknown } }).response;
    const data = res?.data;
    if (data && typeof data === "object") {
      if ("errors" in data) {
        const errors = (data as { errors: Record<string, string[]> }).errors;
        const messages = Object.values(errors).flat();
        if (messages.length) return messages[0];
      }
      if ("error" in data) {
        const apiErr = (data as { error?: { message?: string } }).error;
        if (apiErr?.message) return apiErr.message;
      }
      if ("title" in data) return (data as { title: string }).title;
    }
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

export default function AddDomainModal({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = (val: boolean) => {
    if (!val) {
      setValue("");
      setError("");
    }
    onOpenChange(val);
  };

  const handleSubmit = async () => {
    if (!value.trim()) {
      setError("Please enter a domain name.");
      return;
    }

    // Sanitize input
    const sanitizedDomain = sanitizeDomain(value);

    // Validate with Zod
    const validationResult = domainSchema.safeParse(sanitizedDomain);
    if (!validationResult.success) {
      setError(validationResult.error.issues[0].message);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const domain = await domainService.createDomain({ domain: validationResult.data });
      if (typeof window !== "undefined") {
        localStorage.setItem(`vulnwatch_token_${domain.id}`, domain.verificationToken);
      }
      toast.success("Domain added! Proceeding to verification...");
      onOpenChange(false);
      router.push(`/domain/${domain.id}/verify?token=${encodeURIComponent(domain.verificationToken)}`);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent showCloseButton className="sm:max-w-[520px] rounded-2xl p-6 bg-white border-0 shadow-lg">
        <DialogTitle className="text-xl font-medium text-primary font-geist">
          Add Domain
        </DialogTitle>

        {/* Stepper */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-6 my-4">
          {/* Step 1 */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center text-sm font-semibold text-white">
              1
            </span>
            <span className="text-base font-normal text-brand-slate font-geist">
              Enter Domain
            </span>
          </div>

          {/* 3 Dashes Divider */}
          <div className="hidden sm:block text-gray-300 font-medium select-none tracking-widest whitespace-nowrap">
            ---
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-500">
              2
            </span>
            <span className="text-base font-normal text-gray-500 font-geist">
              Verify Domain Ownership
            </span>
          </div>
        </div>

        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-base font-semibold text-brand-slate font-geist mb-2">
              Domain Name
            </label>
            <div className="relative">
              <Globe
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark opacity-80"
              />
              <input
                type="text"
                placeholder="mycompany.com"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                aria-invalid={!!error}
                aria-describedby={error ? "domain-error" : "domain-hint"}
                className="w-full pl-11 pr-4 h-12 text-sm rounded-xl border border-gray-200 text-brand-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-geist transition-shadow"
              />
            </div>
            {error ? (
              <p id="domain-error" className="text-xs text-error font-geist mt-1.5">{error}</p>
            ) : (
              <p id="domain-hint" className="text-xs text-brand-gray font-geist mt-1.5">
                Enter a valid domain (e.g. example.com)
              </p>
            )}
          </div>

          <div className="flex justify-center pt-2">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 bg-primary text-white hover:bg-primary-hover rounded-xl h-12 text-base font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              {loading ? "Saving..." : "Continue to verification"}
              {!loading && <ArrowRight size={16} />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
