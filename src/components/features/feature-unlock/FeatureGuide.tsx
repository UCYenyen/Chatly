"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useTourTarget } from "@/hooks/use-tour-target";
import type { FeatureGuideStep } from "@/types/feature-tutorial.md";

const SPOTLIGHT_PADDING = 8;
const DIM_COLOR = "rgba(8, 15, 28, 0.72)";

interface FeatureGuideProps {
  steps: FeatureGuideStep[];
  stepIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
}

export function FeatureGuide({
  steps,
  stepIndex,
  onNext,
  onPrev,
  onFinish,
}: FeatureGuideProps) {
  const router = useRouter();
  const pathname = usePathname();
  const step = steps[stepIndex];
  const onRoute = step ? pathname === step.route : false;
  const rect = useTourTarget(step?.selector ?? null, onRoute);

  useEffect(() => {
    if (step && !onRoute) {
      router.push(step.route);
    }
  }, [step, onRoute, router]);

  useEffect(() => {
    if (onRoute && step?.selector) {
      const element = document.querySelector(step.selector);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [onRoute, step?.selector, stepIndex]);

  if (typeof document === "undefined" || !step) return null;

  const isLast = stepIndex === steps.length - 1;
  const blocked = step.canAdvance === false;

  const content = (
    <>
      <AnimatePresence>
        {rect ? (
          <motion.div
            key="feature-guide-cutout"
            className="pointer-events-none fixed z-110 rounded-lg outline-2 outline-secondary-fixed"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              top: rect.top - SPOTLIGHT_PADDING,
              left: rect.left - SPOTLIGHT_PADDING,
              width: rect.width + SPOTLIGHT_PADDING * 2,
              height: rect.height + SPOTLIGHT_PADDING * 2,
            }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            style={{ position: "fixed", boxShadow: `0 0 0 9999px ${DIM_COLOR}` }}
          />
        ) : (
          <motion.div
            key="feature-guide-dim"
            className="pointer-events-none fixed inset-0 z-110"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ backgroundColor: DIM_COLOR }}
          />
        )}
      </AnimatePresence>

      <motion.div
        key={stepIndex}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 left-1/2 z-120 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-outline-variant/20 bg-surface-container-low p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-secondary-fixed font-bold">
            Tutorial fitur
          </span>
          <span className="text-[11px] font-mono text-outline">
            {stepIndex + 1}/{steps.length}
          </span>
        </div>
        <h3 className="mt-2 text-base font-headline font-bold text-on-surface">
          {step.title}
        </h3>
        <p className="mt-1.5 text-[13px] text-outline leading-relaxed">
          {step.body}
        </p>
        {blocked && step.blockedHint ? (
          <p className="mt-2 text-[12px] text-amber-400 leading-relaxed">
            {step.blockedHint}
          </p>
        ) : null}
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onFinish}
            className="text-[12px] text-outline hover:text-on-surface transition-colors"
          >
            Lewati
          </button>
          <div className="flex items-center gap-2">
            {stepIndex > 0 ? (
              <Button type="button" variant="outline" size="sm" onClick={onPrev}>
                Sebelumnya
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              disabled={blocked}
              onClick={isLast ? onFinish : onNext}
            >
              {isLast ? "Selesai" : "Lanjut"}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );

  return createPortal(content, document.body);
}
