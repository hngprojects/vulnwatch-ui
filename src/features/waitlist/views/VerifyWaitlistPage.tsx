"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { waitlistService } from "../services/waitlist.services";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export function VerifyWaitlistPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    !email || !token ? "error" : "loading"
  );
  const [errorMessage, setErrorMessage] = useState(
    !email || !token ? "Missing verification email or token in the URL." : ""
  );

  useEffect(() => {
    if (!email || !token) {
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await waitlistService.verify(email, token);
        if (response.isSuccess) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage(response.error?.message || "Failed to verify email.");
        }
      } catch {
        setStatus("error");
        setErrorMessage("An unexpected error occurred during verification.");
      }
    };

    verifyEmail();
  }, [email, token]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm w-full max-w-lg">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h3 className="text-2xl font-semibold text-brand-dark">Verifying your email...</h3>
            <p className="text-brand-gray">Please wait while we confirm your place on the waitlist.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="h-16 w-16 text-secondary" />
            <h3 className="text-2xl font-semibold text-brand-dark">Email Verified!</h3>
            <p className="text-brand-gray">
              Your email ({email}) has been successfully verified. You are now officially on the VulnWatch waitlist.
            </p>
            <div className="mt-4 w-full">
              <Button asChild className="w-full h-14 text-base rounded-xl font-semibold bg-primary hover:bg-primary/90 text-white">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="h-16 w-16 text-red-500" />
            <h3 className="text-2xl font-semibold text-brand-dark">Verification Failed</h3>
            <p className="text-brand-gray">{errorMessage}</p>
            <div className="mt-4 w-full">
              <Button asChild className="w-full h-14 text-base rounded-xl font-semibold bg-primary hover:bg-primary/90 text-white">
                <Link href={`${ROUTES.WAITLIST}#waitlist-form`}>Back to Waitlist</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
