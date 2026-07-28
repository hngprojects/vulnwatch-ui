import FAQs from "@/features/landing/components/header/Faqs";
import Features from "@/features/landing/components/feature-section/features";
import { Hero } from "@/features/landing/components/hero/Hero";
import Testimonials from "@/features/landing/components/testimonials/Testimonials";
import HowItWorks from "@/features/landing/components/how-it-works-section/HowItWorks";
import { TrustTransparency } from "@/features/landing/components/trust-transparency/TrustTransparency";
import WhyChoose from "@/features/landing/components/why-choose/WhyChoose";

// order in page -
// hero,
// feature section,
// how it works,
// why choose us section,
// pricing section,
// testimonials,
// FAQ,
// trust and transparency (cta section)

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      <WhyChoose />
      {/* <PricingSection /> */}
      <Testimonials />
      <FAQs />
      <TrustTransparency />
    </main>
  );
}
