import { WaitlistStatusPage } from "@/features/waitlist/views/WaitlistStatusPage";

export const metadata = {
  title: "Check Waitlist Status | VulnWatch",
  description: "Check your position on the VulnWatch waitlist.",
};

export default function WaitlistStatusRoute() {
  return <WaitlistStatusPage />;
}
