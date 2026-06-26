import React from "react";
import { CheckCircle2, AlertTriangle, ArrowUpRight, Box, FileJson } from "lucide-react";

export function IntelligenceSection() {
  const benefits = [
    "Plain-English explanation for PMs and execs",
    "Technical deep-dive for engineers",
    "One-click copy of the fix command",
    "Reference links to NVD and GitHub Advisories"
  ];

  return (
    <section className="w-full bg-white py-24 md:py-32">
      <div className="wrapper flex flex-col items-center">
        
        {/* Centered Top Badge */}
        <div className="mb-16 inline-flex items-center justify-center rounded-xl border border-brand-border-gray bg-brand-bg-light px-4 py-2">
          <span className="text-sm font-medium text-brand-dark">Vulnerability Intelligence</span>
        </div>

        {/* Content Split */}
        <div className="flex w-full flex-col gap-16 lg:flex-row lg:items-start lg:justify-between max-w-6xl">
          
          {/* Left Side: Content */}
          <div className="flex flex-1 flex-col items-start max-w-xl">
            <h2 className="mb-6 text-4xl font-semibold tracking-tight text-brand-dark md:text-5xl leading-tight">
              Not just a list of CVEs.<br />A plan to fix them.
            </h2>
            
            <p className="mb-8 text-lg text-brand-gray md:text-xl">
              Each finding includes a severity ranked breakdown, CVSS score affected file path, and AI-generated remediation steps with the exact package version to upgrade to.
            </p>

            <ul className="flex flex-col gap-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0" />
                  <span className="text-lg text-brand-dark">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Side: Mock Card */}
          <div className="flex flex-1 justify-center lg:justify-end w-full">
            <div className="w-full max-w-lg p-6 lg:p-8">
              
              <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-gray-100 pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-scan-red-400 bg-scan-red-bg">
                  <AlertTriangle className="h-6 w-6 text-scan-red-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-xl font-semibold text-brand-dark">lodash</h4>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-scan-red-400 bg-scan-red-bg px-2 py-0.5 text-xs font-medium text-scan-red-400">
                      Critical
                    </span>
                    <span className="text-sm text-brand-gray">CVE-2020-8203 · CVSS 9.8</span>
                  </div>
                </div>
              </div>

              <div className="mb-6 flex flex-col gap-2">
                <h5 className="font-semibold text-brand-dark">Plain English</h5>
                <p className="text-brand-gray">
                  A vulnerable version of lodash was detected. Attacker can inject malicious properties that affect all objects in the app potentially exposing user data.
                </p>
              </div>

              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#F0F0F0] p-4">
                <div className="flex items-center gap-3 text-brand-dark font-medium">
                  <Box className="h-5 w-5 text-brand-dark opacity-70" />
                  <span>4.7.15</span>
                  <ArrowUpRight className="h-4 w-4" />
                  <span>4.7.21</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-brand-dark font-medium">
                  <FileJson className="h-4 w-4" />
                  <span>package.json</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 rounded-xl bg-[#EDEDED] p-4">
                <h5 className="font-semibold text-brand-gray text-sm">Fix command</h5>
                <code className="text-primary font-mono text-sm font-medium">
                  npm install lodash@4.17.21
                </code>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
