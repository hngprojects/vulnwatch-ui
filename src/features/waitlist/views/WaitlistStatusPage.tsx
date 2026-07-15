"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { waitlistService, WaitlistStatusResponse } from "../services/waitlist.services";
import { Loader2, Search } from "lucide-react";

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address." }),
});

type EmailFormValues = z.infer<typeof emailSchema>;

const STATUS_STORAGE_KEY = "vulnwatch_waitlist_status";

export function WaitlistStatusPage() {
  const [statusData, setStatusData] = useState<WaitlistStatusResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const didInit = useRef(false);

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const checkStatus = async (email: string) => {
    setIsChecking(true);
    setErrorMsg("");
    setSuccessMsg("");
    setStatusData(null);
    try {
      const response = await waitlistService.status(email);
      if (response.isSuccess && response.value) {
        setStatusData(response.value);
        if (typeof window !== "undefined") {
          localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(response.value));
        }
      } else {
        setErrorMsg(response.error?.message || "Email not found on waitlist.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred while checking status.");
    } finally {
      setIsChecking(false);
    }
  };

  const onCheckStatus = (data: EmailFormValues) => checkStatus(data.email);

  // On mount: prefer an email passed from registration (?email=) and auto-check;
  // otherwise restore the last looked-up status so a refresh doesn't wipe it.
  useEffect(() => {
    if (typeof window === "undefined" || didInit.current) return;
    didInit.current = true;

    const emailParam = new URLSearchParams(window.location.search).get("email");
    const saved = localStorage.getItem(STATUS_STORAGE_KEY);

    const t = window.setTimeout(() => {
      // An email handed off from registration takes priority — fetch fresh.
      if (emailParam) {
        form.setValue("email", emailParam);
        void checkStatus(emailParam);
        return;
      }
      // Otherwise restore the last look-up so a refresh doesn't wipe it.
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as WaitlistStatusResponse;
          setStatusData(parsed);
          if (parsed.email) form.setValue("email", parsed.email);
        } catch {
          localStorage.removeItem(STATUS_STORAGE_KEY);
        }
      }
    }, 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-brand-bg-light">
      <div className="w-full max-w-xl text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-brand-dark mb-4">Check Waitlist Status</h1>
        <p className="text-lg text-brand-gray">Enter your email address below to see your current place in the queue.</p>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm w-full max-w-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onCheckStatus)} className="flex flex-col gap-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-dark font-semibold text-base">Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="you@company.com" 
                      className="h-14 rounded-xl border-gray-200 text-base placeholder:text-brand-gray px-4" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errorMsg && (
              <p className="text-red-500 text-sm font-medium">{errorMsg}</p>
            )}
            
            {successMsg && (
              <p className="text-green-600 text-sm font-medium">{successMsg}</p>
            )}

            <Button 
              type="submit" 
              disabled={isChecking}
              className="h-14 w-full rounded-xl bg-primary hover:bg-primary/90 text-white text-base font-semibold"
            >
              {isChecking ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
              {isChecking ? "Checking..." : "Check Status"}
            </Button>
          </form>
        </Form>

        {statusData && (
          <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col items-center text-center">
            <div className="mb-4">
              <span className="text-sm font-semibold text-brand-gray uppercase tracking-wider">Your Position</span>
              <div className="text-5xl font-bold text-brand-dark my-2">#{statusData.position}</div>
              
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                  Status: {statusData.status}
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  statusData.emailConfirmed
                    ? "bg-blue-100 text-blue-800"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  Email: {statusData.emailConfirmed ? "Verified" : "Unverified"}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5 mt-2 text-sm text-brand-gray">
              <p>
                Total on Waitlist: <span className="font-semibold text-brand-dark">{statusData.totalOnWaitlist}</span>
              </p>
              <p>
                Registered on: {new Date(statusData.joinedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
