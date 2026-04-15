import { LandingNavbar } from "@/components/features/landing/LandingNavbar";
import { HeroSection } from "@/components/features/landing/HeroSection";
import { FeaturesRow } from "@/components/features/landing/FeaturesRow";
import { PricingSection } from "@/components/features/landing/PricingSection";
import { CtaSection } from "@/components/features/landing/CtaSection";
import { LandingFooter } from "@/components/features/landing/LandingFooter";
import Prism from "@/components/personal/Prism";
import Grainient from "@/components/personal/Grainient";
export default function LandingPage() {
  return (
    <div className="relative w-full flex flex-col min-h-screen bg-background overflow-x-hidden selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <LandingNavbar />
      <div className="w-screen h-screen absolute top-0 left-0">
        <Grainient
          className="opacity-25"
          color1="#87b800"
          color2="#0013a0"
          color3="#131214"
          timeSpeed={0.55}
          colorBalance={0}
          warpStrength={1.75}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={580}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={0.85}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>
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
