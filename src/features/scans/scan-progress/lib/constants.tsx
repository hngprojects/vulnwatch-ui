import { Globe, Lock, LucideSearch, Server, ShieldCheck } from "lucide-react";
import { ProgressItem } from "./types";

export const SCAN_PROGRESS: ProgressItem[] = [
  {
    title: "Checking DNS...",
    description: "Resolving domain records",
    status: "current",
    icon: (
      <div className="bg-[#4338CA1A] p-2.5 rounded-full">
        <Globe className="text-[#0C0F8B]" strokeWidth={1.5} />
      </div>
    ),
  },
  {
    title: "Analyzing SSL....",
    description: "Validating certificate and configuration",
    status: "pending",
    icon: (
      <div className="bg-[#1FC16B1A] p-2.5 rounded-full">
        <Lock className="text-[#1FC16B]" strokeWidth={1.5} />
      </div>
    ),
  },
  {
    title: "Scanning subdomains...",
    description: "Discovering subdomains and assets",
    status: "pending",
    icon: (
      <div className="bg-[#A855F71A] p-2.5 rounded-full">
        <LucideSearch className="text-[#8A1AF4]" strokeWidth={1.5} />
      </div>
    ),
  },
  {
    title: "Checking open ports...",
    description: "Identifying active services",
    status: "pending",
    icon: (
      <div className="bg-[#FFDB431A] p-2.5 rounded-full">
        <Server className="text-[#072E28]" strokeWidth={1.5} />
      </div>
    ),
  },
  {
    title: "Running security checks...",
    description: "Detecting vulnerablities and misconfigurations",
    status: "pending",
    icon: (
      <div className="bg-[#FB37481A] p-2.5 rounded-full">
        <ShieldCheck className="text-[#D00416]" strokeWidth={1.5} />
      </div>
    ),
  },
];
