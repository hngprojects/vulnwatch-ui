import React from "react";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Add Your Domain",
      description: "Enter your domain to configure automatic SSL, DNS, and baseline security tracking for your website."
    },
    {
      number: "02",
      title: "Scan Your Website",
      description: "Run automated security checks across your endpoints to find exposed assets and misconfigurations."
    },
    {
      number: "03",
      title: "Get Report",
      description: "Expiring SSL certificate, misconfigured DNS and exposed admin pages can break your site & lead to loss of customer trust overnight."
    },
    {
      number: "04",
      title: "Connect Your Repositories",
      description: "Authorize VulnWatch with read-only GitHub OAuth. Select the repos you want monitored."
    },
    {
      number: "05",
      title: "Run Your First Scan",
      description: "Our Trivy engine analyzes every dependency file package.json, requirements.txt, go.mod, pom.xml."
    },
    {
      number: "06",
      title: "Monitored and Remediate",
      description: "Get alerted to new CVEs instantly. Follow AI-generated remediation steps with exact version pins."
    }
  ];

  return (
    <section className="w-full bg-[#F1FCEA] py-24 md:py-32">
      <div className="wrapper flex flex-col items-center">
        
        <div className="mb-16 flex flex-col items-center text-center max-w-3xl">
          <div className="mb-6 inline-flex items-center justify-center rounded-xl border border-brand-border-gray bg-white px-4 py-2 shadow-sm">
            <span className="text-sm font-medium text-brand-dark">How It Works</span>
          </div>
          <h2 className="mb-4 text-4xl font-semibold tracking-tight text-brand-dark md:text-5xl">
            Up and Running in Under 5 Minutes
          </h2>
          <p className="text-lg text-brand-gray md:text-xl">
            No installs, no agents, no access to your hosting account.
            <br />
            Just a domain and a minute of your time.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-3 md:gap-x-12 lg:gap-x-16 max-w-6xl">
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
