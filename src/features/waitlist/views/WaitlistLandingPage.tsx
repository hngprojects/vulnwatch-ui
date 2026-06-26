import React from "react";
import { HeroSection } from "../components/HeroSection";
import { CapabilitiesSection } from "../components/CapabilitiesSection";
import { HowItWorksSection } from "../components/HowItWorksSection";
import { IntelligenceSection } from "../components/IntelligenceSection";
import { TestimonialsSection } from "../components/TestimonialsSection";
import { WaitlistFormSection } from "../components/WaitlistFormSection";

export function WaitlistLandingPage() {
  return (
    <div className="flex flex-col w-full bg-white font-geist overflow-hidden">
      <HeroSection />
      <CapabilitiesSection />
      <HowItWorksSection />
      <IntelligenceSection />
      <TestimonialsSection />
      <WaitlistFormSection />
    </div>
  );
}
