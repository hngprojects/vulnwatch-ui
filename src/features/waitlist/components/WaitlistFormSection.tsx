import React from "react";
import { Zap, Sparkles, ShieldCheck } from "lucide-react";
import { WaitlistForm } from "./WaitlistForm";

export function WaitlistFormSection() {
  const features = [
    {
      title: "Be first in line",
      description: "Priority access when we open beta seats.",
      icon: <Zap className="h-6 w-6 text-white" />
    },
    {
      title: "Shape the roadmap",
      description: "Your feature requests directly influence what ships first.",
      icon: <Sparkles className="h-6 w-6 text-white" />
    },
    {
      title: "Free during beta",
      description: "All waitlist members get the beta tier at no cost.",
      icon: <ShieldCheck className="h-6 w-6 text-white" />
    }
  ];

  return (
    <section id="waitlist-form" className="w-full bg-white py-24 md:py-32 border-t border-gray-100">
      <div className="wrapper flex flex-col items-center">
        
        <div className="mb-16 flex flex-col items-center text-center max-w-3xl">
          <div className="mb-6 inline-flex items-center justify-center rounded-xl border border-brand-border-gray bg-white px-4 py-2 shadow-sm">
            <span className="text-sm font-medium text-brand-dark">Early Access</span>
          </div>
          <h2 className="mb-4 text-4xl font-semibold tracking-tight text-brand-dark md:text-5xl">
            Join the GitHub Security<br />Intelligence Waitlist
          </h2>
          <p className="text-lg text-brand-gray md:text-xl">
            We&apos;re onboarding security teams in batches. Drop your email<br />and tell us what would make this an instant yes for your<br />stack. We read every response.
          </p>
        </div>

        <div className="flex w-full flex-col gap-16 lg:flex-row lg:gap-16 max-w-7xl">
          
          {/* Left Side: Features */}
          <div className="flex flex-col gap-10 lg:py-8 lg:w-[35%] shrink-0">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary">
                  {feature.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-xl font-semibold text-brand-dark">{feature.title}</h4>
                  <p className="text-base text-brand-gray">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side: Form */}
          <div className="flex w-full flex-col lg:w-[65%]">
            <WaitlistForm />
          </div>

        </div>

      </div>
    </section>
  );
}
