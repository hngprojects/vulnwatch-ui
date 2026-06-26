import React from "react";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Connect Your Repositories",
      description: "Authorize VulnWatch with read-only GitHub OAuth. Select the repos you want monitored."
    },
    {
      number: "02",
      title: "Run Your First Scan",
      description: "Our Trivy engine analyzes every dependency file package.json, requirements.txt, go.mod, pom.xml."
    },
    {
      number: "03",
      title: "Monitor and Remediate",
      description: "Get alerted to new CVEs instantly. Follow AI-generated remediation steps with exact version pins."
    }
  ];

  return (
    <section className="w-full bg-[#F1FCEA] py-24 md:py-32">
      <div className="wrapper flex flex-col items-center">
        
        <div className="mb-16 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-xl border border-brand-border-gray bg-brand-bg-light px-4 py-2">
            <span className="text-sm font-medium text-brand-dark">How It Works</span>
          </div>
          <h2 className="mb-4 max-w-2xl text-4xl font-semibold tracking-tight text-brand-dark md:text-5xl">
            Up and Running in Under 5 Minutes
          </h2>
          <p className="max-w-2xl text-lg text-brand-gray md:text-xl">
            No installs, no agents, no access to your hosting account. Just link your GitHub and authorize read-only access.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-12 md:grid-cols-3 md:gap-8 lg:gap-16 max-w-6xl">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <span className="mb-6 text-6xl font-semibold text-brand-gray/50">
                {step.number}
              </span>
              <h3 className="mb-3 text-2xl font-semibold text-brand-dark">
                {step.title}
              </h3>
              <p className="text-base text-brand-gray">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
