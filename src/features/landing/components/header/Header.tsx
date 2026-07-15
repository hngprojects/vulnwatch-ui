"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NavLinks } from "./NavLinks";
import { HeaderActions } from "./HeaderActions";
import { MobileMenu } from "./MobileMenu";
import { ROUTES } from "@/constants/routes";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref") || params.get("referralCode");
      if (ref) {
        sessionStorage.setItem("vulnwatch_referral", ref);
      }
    }
  }, []);

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full bg-white"
        style={{ boxShadow: "inset 0px -1px 1px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-4 md:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href={ROUTES.HOME}
            className="flex shrink-0 items-center"
            aria-label="VulnWatch AI home"
          >
            {/* Mobile Logo */}
            <Image
              src="/images/logo.jpg"
              alt="VulnWatch AI"
              width={140}
              height={40}
              className="block h-8 w-auto object-contain md:hidden"
              priority
            />
            {/* Desktop Logo */}
            <Image
              src="/images/logo.jpg"
              alt="VulnWatch AI"
              width={160}
              height={40}
              className="hidden h-10 w-auto object-contain md:block"
              priority
            />
          </Link>

          {/* Desktop nav — hidden on mobile */}
          <div className="hidden lg:flex">
            <NavLinks />
          </div>

          {/* Desktop actions — hidden on mobile */}
          <div className="hidden lg:flex">
            <HeaderActions />
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            aria-label={
              mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
            className="text-primary flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-gray-50 lg:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        toggleButtonId="mobile-menu"
      />
    </>
  );
}
