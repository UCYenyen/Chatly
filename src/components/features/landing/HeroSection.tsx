"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import CountUp from "../../personal/CountUp";
import { useGsapScrollReveal } from "@/hooks/use-gsap-scroll-reveal";
import TextType from "@/components/personal/TextType";
import Shuffle from "@/components/personal/Shuffle";
import Link from "next/link";
import { authClient } from "@/lib/utils/auth/auth-client";
export function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const primaryButtonRef = useRef<HTMLButtonElement | null>(null);
  const secondaryButtonRef = useRef<HTMLButtonElement | null>(null);
  const [ctaWidth, setCtaWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const updateWidth = () => {
      const primaryWidth = primaryButtonRef.current?.offsetWidth ?? 0;
      const secondaryWidth = secondaryButtonRef.current?.offsetWidth ?? 0;
      const width = Math.ceil(Math.max(primaryWidth, secondaryWidth));

      if (width > 0) {
        setCtaWidth(width);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  useGsapScrollReveal(sectionRef, { start: "top 86%", y: 36, fade: false });

  const { data: session } = authClient.useSession();

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col lg:flex-row items-center justify-between container mx-auto px-10 xl:px-16 mt-24 lg:mt-24 gap-16 lg:gap-8"
    >
      <div className="flex flex-col gap-6 w-full lg:w-[45%]">
        <div className="flex items-center gap-2 bg-surface-container-high border border-outline-variant/15 w-fit rounded-full px-3 py-1 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-secondary-fixed shadow-[0_0_5px_rgba(164,215,48,0.8)]"></div>
          <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold">
            <TextType
              text={["System Online", "Hi, I am chatly"]}
              typingSpeed={75}
              pauseDuration={1500}
              showCursor
              cursorCharacter="_"
              deletingSpeed={50}
              cursorBlinkDuration={0.5}
            />
          </span>
        </div>

        <h1 className="text-left text-4xl lg:text-6xl xl:text-7xl font-headline font-bold text-on-surface leading-[1.1] tracking-tight">
          <Shuffle
            text="Your Business,"
            shuffleDirection="right"
            duration={0.35}
            animationMode="evenodd"
            shuffleTimes={1}
            ease="power3.out"
            stagger={0.03}
            threshold={0.1}
            triggerOnce={true}
            triggerOnHover
            respectReducedMotion={true}
            loop={false}
            loopDelay={0}
          />
          <br />

          <TextType
            text={["RESPONDING", "REPLYING"]}
            typingSpeed={75}
            pauseDuration={3500}
            showCursor
            cursorCharacter=""
            deletingSpeed={100}
            cursorBlinkDuration={0.5}
          /> <span className="text-secondary-fixed">24/7.</span>
        </h1>

        <p className="text-[16px] xl:text-[18px] text-outline leading-relaxed max-w-lg mt-2 mb-4">
          Luncurkan agen AI otonom yang menangani pertanyaan pelanggan, menutup
          penjualan, dan mengelola tiket bantuan dengan presisi layaknya manusia
          saat Anda beristirahat.
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button
            ref={primaryButtonRef}
            asChild
            style={ctaWidth ? { width: `${ctaWidth}px` } : undefined}
            className="bg-[#bff44c] text-[#141f00] hover:bg-[#a4d730] font-bold text-[13px] h-12 px-8 rounded-sm shadow-md transition-transform active:scale-95 border border-[#a4d730]"
          >
            <Link href={session ? "/dashboard" : "/sign-in"}>
              Luncurkan Agen Anda
            </Link>
          </Button>
          <Button
            ref={secondaryButtonRef}
            style={ctaWidth ? { width: `${ctaWidth}px` } : undefined}
            className="bg-transparent text-outline hover:text-on-surface hover:bg-surface-container font-medium text-[13px] h-12 px-8 rounded-sm border border-outline-variant transition-all active:scale-95"
          >
            Lihat Dokumentasi
          </Button>
        </div>
      </div>

      <div className="w-full lg:w-[50%] flex justify-end relative">
        <div className="relative w-full max-w-[550px] aspect-square rounded-xl overflow-hidden border border-outline-variant/10 shadow-[0_0_40px_rgba(53,69,214,0.1)]">
          <Image
            draggable={false}
            src="/ai_face.png"
            alt="AI Face"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="absolute left-0 bottom-4 lg:-left-8 lg:bottom-12 bg-surface-container-low/80 backdrop-blur-xl border border-outline-variant/20 p-6 rounded-lg shadow-2xl z-10 w-[180px]">
          <h2 className="text-3xl font-headline font-bold text-secondary-fixed mb-1">
            <CountUp to={98} />%
          </h2>
          <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold">
            Tingkat Resolusi
          </span>
        </div>
      </div>
    </section>
  );
}
