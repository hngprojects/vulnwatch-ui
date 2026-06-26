import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-white from-50% to-secondary">
      {/* Background radial gradients for the soft glow effect */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-white/50 blur-[100px]" />
      
      <div className="wrapper relative z-10 flex flex-col items-center justify-center pb-24 pt-32 text-center md:pb-32 md:pt-40">
        <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-brand-dark md:text-7xl">
          Stop Shipping Known Vulnerabilities
        </h1>
        
        <p className="mx-auto mt-6 max-w-3xl text-lg text-brand-gray md:text-xl">
          VulnWatch connects to your GitHub repos and scans every dependency for CVEs automatically. Continuously, with simple explanations your whole team can act on.
        </p>

        <div className="mt-10">
          <Link href="#waitlist-form">
            <Button 
              size="lg" 
              className="group h-14 rounded-xl border border-secondary bg-primary px-8 text-lg font-semibold text-white hover:bg-primary-hover"
            >
              Join Waitlist
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
