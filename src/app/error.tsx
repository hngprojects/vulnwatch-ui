"use client";

import { useEffect } from "react";
import { RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  unstable_retry?: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleRetry = () => {
    if (reset) {
        reset();
    } else if (unstable_retry) {
        unstable_retry();
    } else {
        window.location.reload();
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#F8FAFC] p-6 text-center">
      <div className="flex max-w-2xl flex-col items-center justify-center space-y-8">
        
        {/* Massive Fancy Error Text */}
        <h1 className="text-[150px] leading-none font-black tracking-tighter text-red-500/5 select-none uppercase">
          Error
        </h1>

        <div className="space-y-4 relative -mt-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] font-inter tracking-tight">
            Something went wrong
          </h2>
          <p className="text-[17px] text-[#64748B] font-medium leading-relaxed max-w-md mx-auto">
            An unexpected error has occurred. Don&apos;t worry, your data is safe. Let&apos;s try getting you back on track.
          </p>
        </div>

        {error.digest && (
          <code className="rounded-full bg-[#E2E8F0] px-4 py-2 text-[13px] text-[#64748B] font-mono border border-[#CBD5E1]">
            Ref: {error.digest}
          </code>
        )}

        <button
          onClick={handleRetry}
          className="group mt-6 flex items-center justify-center gap-2.5 rounded-full bg-[#072E28] px-8 py-4 text-[16px] font-semibold text-white shadow-lg transition-all hover:bg-[#0a423a] hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
        >
          <RefreshCcw className="h-5 w-5 transition-transform group-hover:-rotate-180 duration-500" />
          Try again
        </button>
      </div>
    </div>
  );
}
