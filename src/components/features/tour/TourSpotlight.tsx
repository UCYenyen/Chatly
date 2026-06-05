"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useTourTarget } from "@/hooks/use-tour-target";
import { useTour } from "./TourProvider";
import { matchTourRoute } from "./tour-steps";

const SPOTLIGHT_PADDING = 8;
const DIM_COLOR = "rgba(8, 15, 28, 0.72)";

export function TourSpotlight() {
  const { isActive, currentStep } = useTour();
  const pathname = usePathname();

  const routeMatches = currentStep
    ? matchTourRoute(currentStep.route, pathname)
    : false;
  const hasTarget = Boolean(currentStep?.targetSelector) && routeMatches;
  const rect = useTourTarget(
    currentStep?.targetSelector ?? null,
    isActive && hasTarget,
  );

  return (
    <AnimatePresence>
      {isActive && currentStep ? (
        rect ? (
          <motion.div
            key="tour-spotlight-cutout"
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
            style={{
              position: "fixed",
              boxShadow: `0 0 0 9999px ${DIM_COLOR}`,
            }}
          />
        ) : (
          <motion.div
            key="tour-spotlight-dim"
            className="pointer-events-none fixed inset-0 z-110"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ backgroundColor: DIM_COLOR }}
          />
        )
      ) : null}
    </AnimatePresence>
  );
}
