"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function Hero({
  eyebrow = "Innovate Without Limits",
  title,
  subtitle,
  ctaLabel = "Explore Now",
  ctaHref = "#",
}: HeroProps) {
  return (
    <section
      id="hero"
      className="relative w-full min-h-screen flex flex-col justify-center items-center px-6 text-center md:px-8 min-h-[calc(100vh-40px)] overflow-hidden bg-[linear-gradient(to_bottom,#081422,transparent_40%,#4e7d2b_98%,#bff44c_99%)]"
    >
      <div className="absolute -z-10 h-full inset-0 opacity-80 h-[600px] w-full bg-[linear-gradient(to_right,#1f2b39_1px,transparent_1px),linear-gradient(to_bottom,#1f2b39_1px,transparent_1px)] bg-[size:6rem_5rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="absolute left-1/2 top-[calc(100%-90px)] lg:top-[calc(100%-150px)] h-[500px] w-[700px] md:h-[500px] md:w-[1100px] lg:h-[750px] lg:w-[140%] -translate-x-1/2 rounded-[100%] border-[#bff44c] bg-[#081422] bg-[radial-gradient(closest-side,#081422_80%,#bff44c)] animate-fade-up" />

      {eyebrow ? (
        <a href={ctaHref} className="group">
          <span className="text-sm text-secondary-fixed mx-auto px-5 py-2 bg-gradient-to-tr from-[#bff44c]/10 via-[#3545d6]/10 to-transparent border-[2px] border-[#bff44c]/20 rounded-3xl w-fit tracking-tight uppercase flex items-center justify-center">
            {eyebrow}
            <ChevronRight className="inline w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </a>
      ) : null}

      <h1 className="animate-fade-in -translate-y-4 text-balance font-headline bg-gradient-to-br from-white from-30% via-[#d7e3f7] to-[#bdc2ff] bg-clip-text py-6 text-5xl font-semibold leading-none tracking-tighter text-transparent opacity-0 sm:text-6xl md:text-7xl lg:text-8xl">
        {title}
      </h1>

      <p className="animate-fade-in mb-12 -translate-y-4 text-balance text-lg tracking-tight text-outline opacity-0 md:text-xl mx-auto max-w-2xl">
        {subtitle}
      </p>

      {ctaLabel ? (
        <div className="flex justify-center">
          <Button
            asChild
            className="mt-[-20px] w-fit md:w-52 z-20 tracking-tighter text-center text-lg bg-[#bff44c] text-[#141f00] hover:bg-[#a4d730] font-bold border border-[#a4d730]"
          >
            <a href={ctaHref}>{ctaLabel}</a>
          </Button>
        </div>
      ) : null}

      <div className="animate-fade-up relative mt-32 opacity-0 [perspective:2000px] after:absolute after:inset-0 after:z-50 after:[background:linear-gradient(to_top,var(--background)_10%,transparent)]" />
    </section>
  );
}
