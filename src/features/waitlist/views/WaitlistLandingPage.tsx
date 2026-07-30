import React from "react";
import { HeroSection } from "../components/HeroSection";
import { CapabilitiesSection } from "../components/CapabilitiesSection";
import HowItWorks from "@/features/landing/components/how-it-works-section/HowItWorks";
import { IntelligenceSection } from "../components/IntelligenceSection";
import { TestimonialsSection } from "../components/TestimonialsSection";
import { WaitlistFormSection } from "../components/WaitlistFormSection";

export function WaitlistLandingPage() {
  return (
    <div className="flex flex-col w-full bg-white font-geist overflow-hidden">
      <HeroSection />
      <CapabilitiesSection />
      <HowItWorks />
      <IntelligenceSection />
      <TestimonialsSection />
      <WaitlistFormSection />
    </div>
  );
}
