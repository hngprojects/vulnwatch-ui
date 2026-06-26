import { Suspense } from "react";
import { VerifyWaitlistPage } from "@/features/waitlist/views/VerifyWaitlistPage";

export const metadata = {
  title: "Verify Waitlist | VulnWatch",
  description: "Verify your email to join the VulnWatch waitlist.",
};

export default function WaitlistVerifyRoute() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]">Loading...</div>}>
      <VerifyWaitlistPage />
    </Suspense>
  );
}
