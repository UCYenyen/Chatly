import { LandingNavbar } from "@/components/features/landing/LandingNavbar";
import { HeroSection } from "@/components/features/landing/HeroSection";
import { FeaturesRow } from "@/components/features/landing/FeaturesRow";
import { PricingSection } from "@/components/features/landing/PricingSection";
import { CtaSection } from "@/components/features/landing/CtaSection";
import { LandingFooter } from "@/components/features/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="w-full flex flex-col min-h-screen bg-background overflow-x-hidden selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <LandingNavbar />

      <main className="flex-1 w-full flex flex-col">
        <HeroSection />
        <FeaturesRow />
        <PricingSection />
        <CtaSection />
      </main>

      <LandingFooter />
    </div>
  );
}
