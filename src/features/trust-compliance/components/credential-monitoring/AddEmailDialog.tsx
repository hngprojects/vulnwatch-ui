"use client";

import { useState } from "react";
import { X, Mail, Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { EmailSchema } from "@/schemas";

interface AddEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (email: string) => Promise<void>;
  isLoading?: boolean;
}

export function AddEmailDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: AddEmailDialogProps) {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email || !agreed || isSubmitting || isLoading) return;

    const result = EmailSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await onSubmit(result.data.email);
      setEmail("");
      setAgreed(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setAgreed(false);
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="w-[471px] max-w-[calc(100%-2rem)] rounded-3xl p-6 flex flex-col items-stretch gap-0"
      >
        {/* Inner wrapper */}
        <div className="flex flex-col items-end gap-6 w-full">
          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="text-[#666666] hover:text-brand-dark transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>

          {/* Content */}
          <div className="flex flex-col items-center gap-6 w-full">
            {/* Mail icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#A0E870]">
              <Mail className="h-6 w-6 text-[#072E28]" strokeWidth={1.5} />
            </div>

            {/* Text + form */}
            <div className="flex flex-col items-center gap-6 w-full">
              {/* Heading */}
              <div className="flex flex-col items-center gap-4">
                <h2 className="text-2xl font-semibold text-black text-center leading-none">
                  Add Your Email
                </h2>
                <p className="text-base font-normal text-[#666666] text-center leading-none">
                  Please enter the email be be monitored
                </p>
              </div>

              <div className="w-full">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className={cn(
                    "w-full h-12 px-6 py-4 border rounded-lg text-base text-brand-dark placeholder:text-brand-dark outline-none transition-colors",
                    error ? "border-red-500 focus:border-red-500" : "border-[#EDEDED] focus:border-[#072E28]"
                  )}
                />
                {error && <p className="mt-1.5 text-xs text-red-500 text-left">{error}</p>}
              </div>

              {/* Consent checkbox */}
              <button
                type="button"
                onClick={() => setAgreed(!agreed)}
                className="w-full flex items-start gap-4 p-4 border border-[#072E28] rounded-lg text-left"
              >
                {/* Checkbox */}
                <div
                  className={cn(
                    "flex-shrink-0 h-6 w-6 rounded flex items-center justify-center transition-colors",
                    agreed ? "bg-[#072E28]" : "border border-[#072E28] bg-white"
                  )}
                >
                  {agreed && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                </div>
                {/* Text */}
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-brand-dark leading-none mt-[2px]">
                    By clicking you agree for your email to be monitored.
                  </p>
                </div>
              </button>

              {/* Buttons */}
              <div className="flex flex-col gap-4 w-full">
                {/* Submit */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || !email || !agreed}
                  className="w-full flex items-center justify-center gap-2 bg-[#072E28] text-white rounded-lg py-[14px] text-base font-medium tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0a3d35] transition-colors"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit
                </button>
                {/* Maybe Later */}
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full flex items-center justify-center border border-[#EDEDED] rounded-lg py-[14px] text-base font-medium text-[#666666] hover:bg-gray-50 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
