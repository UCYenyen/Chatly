"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let isRegistered = false;

type GsapScrollRevealOptions = {
  start?: string;
  end?: string;
  y?: number;
  duration?: number;
  ease?: string;
  once?: boolean;
  scrub?: boolean | number;
  stagger?: number;
  selector?: string;
  fade?: boolean;
};

export function useGsapScrollReveal<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options: GsapScrollRevealOptions = {},
) {
  const {
    start = "top 82%",
    end = "bottom 20%",
    y = 12,
    duration = 0.65,
    ease = "power2.out",
    once = true,
    scrub = false,
    stagger = 0,
    selector,
    fade = true,
  } = options;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (!isRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      isRegistered = true;
    }

    const element = ref.current;
    if (!element) return;

    const targets = selector
      ? element.querySelectorAll<HTMLElement>(selector)
      : [element];

    if (!targets.length) return;

    const ctx = gsap.context(() => {
      gsap.set(targets, { willChange: "transform,opacity" });

      const fromVars: gsap.TweenVars = fade ? { autoAlpha: 0, y } : { y };
      const toVars: gsap.TweenVars = {
        y: 0,
        duration,
        ease,
        stagger,
        immediateRender: false,
        onComplete: () => {
          gsap.set(targets, {
            clearProps: fade
              ? "transform,opacity,visibility,willChange"
              : "transform,willChange",
          });
        },
        scrollTrigger: {
          trigger: element,
          start,
          end,
          toggleActions: once
            ? "play none none none"
            : "play none none reverse",
          once,
          scrub,
          invalidateOnRefresh: true,
        },
      };

      if (fade) {
        toVars.autoAlpha = 1;
      }

      gsap.fromTo(targets, fromVars, toVars);
    }, element);

    return () => {
      ctx.revert();
    };
  }, [ref, start, end, y, duration, ease, once, scrub, stagger, selector, fade]);
}