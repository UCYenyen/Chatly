"use client";

import { TransitionRouter } from "next-transition-router";
import { useRef } from "react";
import gsap from "gsap";
import { Rocket } from "lucide-react";

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  return (
    <TransitionRouter
      auto={true}
      leave={(next) => {
        const tl = gsap.timeline({
          onComplete: next,
        });

        tl.to(layer1Ref.current, {
          y: "0%",
          duration: 0.5,
          ease: "circ.inOut",
        })
          .to(
            layer2Ref.current,
            {
              y: "0%",
              duration: 0.5,
              ease: "circ.inOut",
            },
            "-=0.35"
          )
          .to(loaderRef.current, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
          });
      }}
      enter={(next) => {
        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set([layer1Ref.current, layer2Ref.current], { y: "100%" });
            next();
          },
        });

        tl.to(loaderRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        })
          .to(layer2Ref.current, {
            y: "-100%",
            duration: 0.5,
            ease: "circ.inOut",
          })
          .to(
            layer1Ref.current,
            {
              y: "-100%",
              duration: 0.5,
              ease: "circ.inOut",
            },
            "-=0.35"
          );
      }}
    >
      <div ref={layer1Ref} className="curtain-layer-1" />
      <div ref={layer2Ref} className="curtain-layer-2" />
      <div ref={loaderRef} className="transition-loader">
        <div className="w-16 h-16 bg-secondary-fixed rounded-xl flex items-center justify-center text-on-secondary shadow-2xl loader-logo">
          <Rocket className="w-8 h-8 font-black" />
        </div>
        <span className="loader-text">Memproses Halaman...</span>
      </div>
      <div className="page-content-wrapper">
        {children}
      </div>
    </TransitionRouter>
  );
}
