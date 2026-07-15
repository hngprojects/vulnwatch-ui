"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export function HeaderActions() {
  const pathname = usePathname();

  // If on Home page or Waitlist page, do not render any buttons in the header
  if (pathname === ROUTES.HOME || pathname === ROUTES.WAITLIST) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`${ROUTES.WAITLIST}#waitlist-form`}
        className="border-primary text-primary flex h-11 items-center
         justify-center gap-1.5 rounded-xl border-2 bg-white px-6 py-3
         text-base leading-6 font-medium transition-all duration-400
         hover:bg-primary hover:text-white"
      >
        Join Waitlist
      </Link>
    </div>
  );
}
