"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { HERO_ARIA } from "../../constants/hero-content";
import { ROUTES } from "@/constants/routes";

export function HeroScanForm() {
  const router = useRouter();

  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={() => router.push(`${ROUTES.WAITLIST}#waitlist-form`)}
        className="flex items-center justify-center gap-2.5 w-[260px] h-[62px]
          rounded-2xl bg-[#072E28] transition-opacity hover:opacity-90
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[#072E28] px-6 text-white cursor-pointer"
        aria-label="Join waitlist"
      >
        <span className="font-inter text-base leading-5 font-semibold text-white">
          Join waitlist
        </span>
        <ArrowRight className="h-5 w-5 text-white stroke-[2.5px]" />
      </button>
    </div>
  );
}