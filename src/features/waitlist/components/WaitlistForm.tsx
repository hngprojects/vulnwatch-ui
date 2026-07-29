"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { waitlistService } from "../services/waitlist.services";

const REFERRAL_CODE_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

const waitlistSchema = z.object({
  workEmail: z.string().trim().email({ message: "Please enter a valid email address." }),
  company: z.string().trim().optional(),
  features: z
    .array(z.string())
    .min(1, { message: "Please select at least one feature." }),
  additionalInfo: z.string().trim().optional(),
  referralCode: z
    .string()
    .trim()
    .max(64, { message: "Referral code is too long." })
    .regex(/^[A-Za-z0-9_-]*$/, {
      message: "Referral code can only contain letters, numbers, hyphens, and underscores.",
    })
    .optional(),
});

type WaitlistFormValues = z.infer<typeof waitlistSchema>;

const featuresList = [
  "Monitoring",
  "Email / Slack alerts",
  "Microsoft Teams Alerts",
  "GitLab Support",
  "Bitbucket Support",
  "SBOM Expert (CycloneDX)",
  "Jira Auto-ticketing",
  "SSO / SAML",
  "Per-repo Severity Policies",
  "PR Comment Bot",
  "License Compliance",
  "Domain Security Scanning",
  "AI Powered Translation",
  "Security Score / Remediation Cards"
];

const SUBMITTED_STORAGE_KEY = "vulnwatch_waitlist_submitted";

export function WaitlistForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const confirmationRef = useRef<HTMLDivElement>(null);

  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      workEmail: "",
      company: "",
      features: [],
      additionalInfo: "",
      referralCode: "",
    },
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlRef = params.get("ref") || params.get("referralCode");
      const storedRef = sessionStorage.getItem("vulnwatch_referral");

      const ref = urlRef || storedRef;
      // Only accept a well-formed referral code; ignore anything malicious.
      if (ref && REFERRAL_CODE_PATTERN.test(ref)) {
        form.setValue("referralCode", ref);
        if (urlRef) sessionStorage.setItem("vulnwatch_referral", ref);
      }
    }
  }, [form]);

  // Restore the confirmation state after a refresh.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(SUBMITTED_STORAGE_KEY);
    if (!saved) return;
    const t = window.setTimeout(() => {
      setSubmittedEmail(saved);
      setIsSubmitted(true);
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  // Keep the confirmation card in view instead of leaving the page scrolled down.
  useEffect(() => {
    if (isSubmitted) {
      confirmationRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isSubmitted]);

  const handleReset = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SUBMITTED_STORAGE_KEY);
    }
    setSubmittedEmail("");
    setIsSubmitted(false);
    form.reset();
  };

  const onSubmit = async (data: WaitlistFormValues) => {
    try {
      const combinedComments = `Selected Features: ${data.features.join(", ")}${
        data.additionalInfo ? ` | Comments: ${data.additionalInfo}` : ""
      }`;

      const response = await waitlistService.join({
        email: data.workEmail,
        companyName: data.company || undefined,
        comments: combinedComments,
        referralCode: data.referralCode || undefined,
      });

      if (response.isSuccess && response.value) {
        if (typeof window !== "undefined") {
          localStorage.setItem(SUBMITTED_STORAGE_KEY, data.workEmail);
        }
        setSubmittedEmail(data.workEmail);
        setIsSubmitted(true);
      } else {
        form.setError("root", { 
          type: "manual", 
          message: response.error?.message || "Failed to join waitlist. Please try again." 
        });
      }
    } catch (error) {
      console.error("Waitlist submission error:", error);
      form.setError("root", { 
        type: "manual", 
        message: "An unexpected error occurred. Please try again later." 
      });
    }
  };

  if (isSubmitted) {
    return (
      <div
        ref={confirmationRef}
        className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-brand-bg-light p-12 text-center shadow-sm"
      >
        <CheckCircle2 className="mb-4 h-16 w-16 text-secondary" />
        <h3 className="mb-2 text-2xl font-semibold text-brand-dark">Almost there!</h3>
        <p className="text-brand-gray">
          We&apos;ve sent a message to your email address. Please check your inbox for further details.
        </p>

        <Link
          href={`/waitlist/status${submittedEmail ? `?email=${encodeURIComponent(submittedEmail)}` : ""}`}
          className="group mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-white transition-colors hover:bg-primary/90"
        >
          Check your waitlist status
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>

        <button
          type="button"
          onClick={handleReset}
          className="mt-4 text-sm font-medium text-brand-gray underline-offset-2 hover:text-brand-dark hover:underline"
        >
          Join with a different email
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8 w-full max-w-3xl ml-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
          
          <div className="flex flex-col md:flex-row gap-6">
            <FormField
              control={form.control}
              name="workEmail"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-brand-dark font-semibold text-base flex items-center gap-2">
                     Email 
                    {/* <span className="h-3 w-3 rounded-full bg-green-400" /> */}
                  </FormLabel>
                  <FormControl>
                    <div className="relative mt-2">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-gray" />
                      <Input placeholder="you@company.com" className="h-14 rounded-xl border-gray-200 pl-11 text-base placeholder:text-brand-gray" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-brand-dark font-semibold text-base">
                    Company <span className="text-brand-gray font-normal text-sm">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="mt-2">
                      <Input placeholder="Acme Inc." className="h-14 rounded-xl border-gray-200 text-base placeholder:text-brand-gray px-4" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <FormField
              control={form.control}
              name="referralCode"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-brand-dark font-semibold text-base">
                    Referral Code <span className="text-brand-gray font-normal text-sm">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="mt-2">
                      <Input placeholder="Enter code or leave blank" className="h-14 rounded-xl border-gray-200 text-base placeholder:text-brand-gray px-4" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex-1 hidden md:block"></div>
          </div>

          <FormField
            control={form.control}
            name="features"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-brand-dark font-semibold text-base">Which Features Would You Actually Use?</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-4 pt-2">
                    {featuresList.map((fw) => {
                      const isSelected = field.value.includes(fw);
                      return (
                        <button
                          key={fw}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() =>
                            field.onChange(
                              isSelected
                                ? field.value.filter((f) => f !== fw)
                                : [...field.value, fw]
                            )
                          }
                          className={cn(
                            "rounded-xl border h-12 px-4 text-base transition-colors",
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-primary bg-white text-primary hover:bg-gray-50"
                          )}
                        >
                          {fw}
                        </button>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="additionalInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex justify-between items-center mb-2">
                  <span className="text-brand-dark font-semibold text-base">Anything Else You&apos;d Love to See?</span>
                  <span className="text-brand-gray font-normal text-base hidden md:inline">Free text, we read every one</span>
                </FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="e.g. native ServiceNow tickets, custom severity rules per repo, support for Terraform modules......" 
                    className="min-h-[192px] rounded-xl border-gray-200 text-base placeholder:text-brand-gray resize-none p-4" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col items-center gap-6 mt-2">
            {form.formState.errors.root && (
              <p className="text-red-500 text-sm font-medium text-center">
                {form.formState.errors.root.message}
              </p>
            )}
            
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting}
              className="group h-14 w-full rounded-xl bg-primary border border-green-400 text-lg font-semibold text-white hover:bg-primary/90"
            >
              {form.formState.isSubmitting ? "Submitting..." : "Join Waitlist"}
              {!form.formState.isSubmitting && (
                <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
              )}
            </Button>

            <p className="text-center text-base text-brand-gray">
              No spam. Unsubscribe anytime. We never share your email.
            </p>
          </div>

        </form>
      </Form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center text-base text-brand-gray">
        Already registered?{" "}
        <a href="/waitlist/status" className="font-semibold text-primary hover:underline">
          Check your waitlist status
        </a>
      </div>
    </div>
  );
}
