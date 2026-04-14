import { LandingNavbar } from "@/components/landing/LandingNavbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { FeaturesRow } from "@/components/landing/FeaturesRow"
import { PricingSection } from "@/components/landing/PricingSection"
import { CtaSection } from "@/components/landing/CtaSection"
import { LandingFooter } from "@/components/landing/LandingFooter"

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
  )
}
