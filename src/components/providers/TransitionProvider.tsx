"use client";

import { TransitionRouter } from "next-transition-router";
import { useRef } from "react";
import gsap from "gsap";

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);

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
        }).to(
          layer2Ref.current,
          {
            y: "0%",
            duration: 0.5,
            ease: "circ.inOut",
          },
          "-=0.35"
        );
      }}
      enter={(next) => {
        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set([layer1Ref.current, layer2Ref.current], { y: "100%" });
            next();
          },
        });

        tl.to(layer2Ref.current, {
          y: "-100%",
          duration: 0.5,
          ease: "circ.inOut",
        }).to(
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
      <div className="page-content-wrapper">
        {children}
      </div>
    </TransitionRouter>
  );
}
