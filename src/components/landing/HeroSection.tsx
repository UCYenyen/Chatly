import { Button } from "@/components/ui/button";
import Image from "next/image";
import CountUp from "../personal/CountUp";
import Prism from "../Prism";

export function HeroSection() {
  return (
    <section className="relative flex flex-col lg:flex-row items-center justify-between container mx-auto px-10 xl:px-16 mt-16 lg:mt-24 gap-16 lg:gap-8">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <Prism
          animationType="rotate"
          timeScale={0.5}
          scale={3.6}
          height={4.2}
          baseWidth={4.4}
          noise={0.55}
          glow={1}
          hueShift={0}
          colorFrequency={1}
        />
      </div>
      <div className="flex flex-col gap-6 w-full lg:w-[45%]">
        <div className="flex items-center gap-2 bg-surface-container-high border border-outline-variant/15 w-fit rounded-full px-3 py-1 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-secondary-fixed shadow-[0_0_5px_rgba(164,215,48,0.8)]"></div>
          <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold">
            System Online
          </span>
        </div>

        <h1 className="text-5xl lg:text-6xl xl:text-7xl font-headline font-bold text-on-surface leading-[1.1] tracking-tight">
          Your Business, <br />
          responding <span className="text-secondary-fixed">24/7.</span>
        </h1>

        <p className="text-[16px] xl:text-[18px] text-outline leading-relaxed max-w-lg mt-2 mb-4">
          Deploy autonomous AI agents that handle customer inquiries, close
          sales, and manage support tickets with human-like precision while you
          sleep.
        </p>

        <div className="flex items-center gap-4">
          <Button className="bg-[#bff44c] text-[#141f00] hover:bg-[#a4d730] font-bold text-[13px] h-12 px-8 rounded-sm shadow-md transition-transform active:scale-95 border border-[#a4d730]">
            Launch Your Agent
          </Button>
          <Button className="bg-transparent text-outline hover:text-on-surface hover:bg-surface-container font-medium text-[13px] h-12 px-8 rounded-sm border border-outline-variant/20 transition-all active:scale-95">
            View Documentation
          </Button>
        </div>
      </div>

      <div className="w-full lg:w-[50%] flex justify-end relative">
        <div className="relative w-full max-w-[550px] aspect-square rounded-xl overflow-hidden border border-outline-variant/10 shadow-[0_0_40px_rgba(53,69,214,0.1)]">
          <Image
            src="/ai_face.png"
            alt="AI Face"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Floating resolution rate badge */}
        <div className="absolute left-0 bottom-4 lg:-left-8 lg:bottom-12 bg-surface-container-low/80 backdrop-blur-xl border border-outline-variant/20 p-6 rounded-lg shadow-2xl z-10 w-[180px]">
          <h2 className="text-3xl font-headline font-bold text-secondary-fixed mb-1">
            <CountUp to={98} />%
          </h2>
          <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold">
            Resolution Rate
          </span>
        </div>
      </div>
    </section>
  );
}
