"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "../../constants/nav-links";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  toggleButtonId?: string;
}

/** Renders the mobile navigation drawer with focus-trap and keyboard (Escape/Tab) handling. */
export function MobileMenu({ isOpen, onClose, toggleButtonId }: MobileMenuProps) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLElement>(null);
  const firstFocusableRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousActiveElement = document.activeElement as HTMLElement;

    if (menuRef.current) {
      menuRef.current.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "Tab") {
        if (!menuRef.current) return;

        const focusableElements = menuRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement || document.activeElement === menuRef.current) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);

      if (toggleButtonId) {
        const toggleButton = document.getElementById(toggleButtonId);
        if (toggleButton) {
          toggleButton.focus();
          return;
        }
      } else if (previousActiveElement && document.contains(previousActiveElement)) {
        previousActiveElement.focus();
      }

      if (previousActiveElement && document.contains(previousActiveElement)) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen, onClose, toggleButtonId]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-x-0 top-[72px] bottom-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
      />

      <nav
        ref={menuRef}
        id={toggleButtonId}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
        tabIndex={-1}
        className="fixed inset-x-0 top-[72px] z-[60] max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-gray-100 bg-white px-5 py-6 shadow-xl lg:hidden"
      >
        <ul className="flex flex-col gap-5">
          {NAV_LINKS.map(({ label, href }, index) => {
            const isActive = pathname === href;

            return (
              <li key={href}>
                <Link
                  ref={index === 0 ? firstFocusableRef : undefined}
                  href={href}
                  onClick={onClose}
                  className={cn(
                    "font-geist block rounded-lg px-2 py-2 text-lg font-medium cursor-pointer transition-all duration-200 hover:bg-primary/10 hover:pl-4",
                    isActive ? "text-primary" : "text-[#45625E]"
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {pathname !== ROUTES.HOME && pathname !== ROUTES.WAITLIST && (
          <>
            <div className="mt-6 border-t border-gray-100" />
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={`${ROUTES.WAITLIST}#waitlist-form`}
                onClick={onClose}
                className="border-primary text-primary flex h-12 w-full items-center
                justify-center rounded-xl border-2 bg-white text-base font-medium
                transition-all duration-200 hover:bg-primary hover:text-white"
              >
                Join Waitlist
              </Link>
            </div>
          </>
        )}
      </nav>
    </>
  );
}