import React from "react";
import { Zap, Bell, Eye } from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path>
  </svg>
);

export function CapabilitiesSection() {
  const capabilities = [
    {
      title: "GitHub OAuth in one click",
      description: "Connect your organization with read-only access. We never push commits, create PRs, or touch your code.",
      icon: <GithubIcon className="h-6 w-6 text-white" />
    },
    {
      title: "Trivy-Powered Deep Scanning",
      description: "Full dependency tree analysis across npm, pip, Go modules, Maven, and more in under 20 seconds.",
      icon: <Zap className="h-6 w-6 text-white" />
    },
    {
      title: "Zero-day CVE Monitoring",
      description: "Continuous background monitoring alerts you the moment a newly disclosed CVE affects your dependencies.",
      icon: <Bell className="h-6 w-6 text-white" />
    },
    {
      title: "AI-Generated Explanations",
      description: "Every vulnerability comes with plain English and technical explanations so your whole team can act, not just security.",
      icon: <Eye className="h-6 w-6 text-white" />
    }
  ];

  return (
    <section className="w-full bg-white py-24 md:py-32">
      <div className="wrapper flex flex-col items-center">
        
        <div className="mb-16 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-xl border border-brand-border-gray bg-brand-bg-light px-4 py-2">
            <span className="text-sm font-medium text-brand-dark">Capabilities</span>
          </div>
          <h2 className="mb-4 max-w-2xl text-4xl font-semibold tracking-tight text-brand-dark md:text-5xl">
            Everything Your Security Team Needs
          </h2>
          <p className="max-w-2xl text-lg text-brand-gray md:text-xl">
            Built on the same Trivy scanner trusted by Kubernetes and Docker Hub, wrapped in a workflow your team can use
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-5xl">
          {capabilities.map((item, index) => (
            <div 
              key={index} 
              className="flex flex-col items-start rounded-2xl border-2 border-[#EFEFEF] bg-white p-6 md:p-8 transition-shadow hover:shadow-md"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                {item.icon}
              </div>
              <h3 className="mb-2 text-xl font-semibold text-brand-dark">
                {item.title}
              </h3>
              <p className="text-base text-brand-gray">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
