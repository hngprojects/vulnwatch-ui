import { Metadata } from "next";
import { WaitlistLandingPage } from "@/features/waitlist/views/WaitlistLandingPage";

export const metadata: Metadata = {
  title: "Waitlist - VulnWatch AI",
  description: "Join the GitHub Security Intelligence Waitlist. Stop shipping known vulnerabilities with AI-generated explanations and precise remediation.",
};

export default function WaitlistPage() {
  return <WaitlistLandingPage />;
}
