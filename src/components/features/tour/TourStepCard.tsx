"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { MousePointerClick } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTourTarget } from "@/hooks/use-tour-target";
import type { TourPlacement } from "@/types/tour.md";
import { useTour } from "./TourProvider";
import { matchTourRoute } from "./tour-steps";

const CARD_OFFSET = 18;
const VIEWPORT_MARGIN = 12;

interface PositionStyle {
  left: number | string;
  top: number | string;
  transform: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function computePosition(
  rect: DOMRect | null,
  placement: TourPlacement,
): PositionStyle {
  if (!rect || placement === "center") {
    return { left: "50%", top: "50%", transform: "translate(-50%, -50%)" };
  }

  const viewportWidth = typeof window === "undefined" ? 1024 : window.innerWidth;
  const viewportHeight =
    typeof window === "undefined" ? 768 : window.innerHeight;
  const clampX = (x: number): number =>
    clamp(x, VIEWPORT_MARGIN, viewportWidth - VIEWPORT_MARGIN);
  const clampY = (y: number): number =>
    clamp(y, VIEWPORT_MARGIN, viewportHeight - VIEWPORT_MARGIN);

  switch (placement) {
    case "right":
      return {
        left: clampX(rect.right + CARD_OFFSET),
        top: clampY(rect.top + rect.height / 2),
        transform: "translateY(-50%)",
      };
    case "left":
      return {
        left: clampX(rect.left - CARD_OFFSET),
        top: clampY(rect.top + rect.height / 2),
        transform: "translate(-100%, -50%)",
      };
    case "top":
      return {
        left: clampX(rect.left + rect.width / 2),
        top: clampY(rect.top - CARD_OFFSET),
        transform: "translate(-50%, -100%)",
      };
    default:
      return {
        left: clampX(rect.left + rect.width / 2),
        top: clampY(rect.bottom + CARD_OFFSET),
        transform: "translateX(-50%)",
      };
  }
}

export function TourStepCard() {
  const { isActive, currentStep, state, steps, next, prev, skip } = useTour();
  const pathname = usePathname();

  const routeMatches = currentStep
    ? matchTourRoute(currentStep.route, pathname)
    : false;
  const hasTarget = Boolean(currentStep?.targetSelector) && routeMatches;
  const rect = useTourTarget(
    currentStep?.targetSelector ?? null,
    isActive && hasTarget,
  );

  useEffect(() => {
    if (!isActive || !currentStep) return;
    if (currentStep.advance !== "target-click") return;
    if (!routeMatches || !currentStep.targetSelector) return;
    const selector = currentStep.targetSelector;
    const handler = (event: MouseEvent): void => {
      const target = event.target as Element | null;
      if (target?.closest(selector)) next();
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [isActive, currentStep, routeMatches, next]);

  if (!isActive || !currentStep) return null;

  const stepNumber = state.stepIndex + 1;
  const totalSteps = steps.length;
  const isLast = state.stepIndex === totalSteps - 1;
  const isFirst = state.stepIndex === 0;
  const position = computePosition(routeMatches ? rect : null, currentStep.placement);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep.id}
        className="pointer-events-auto fixed z-111 w-[min(360px,90vw)]"
        style={{
          left: position.left,
          top: position.top,
          transform: position.transform,
        }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18 }}
      >
        <Card className="border-outline-variant/20 bg-surface shadow-2xl">
          <CardHeader className="gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-label uppercase tracking-widest text-secondary-fixed">
                Langkah {stepNumber} dari {totalSteps}
              </span>
            </div>
            <Progress value={(stepNumber / totalSteps) * 100} className="h-1.5" />
            <CardTitle className="text-lg font-headline text-on-surface">
              {currentStep.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm leading-relaxed text-on-surface-variant">
              {currentStep.body}
            </CardDescription>
            {!routeMatches && currentStep.route ? (
              <p className="mt-3 text-xs text-outline">
                Arahkan ke halaman yang sesuai untuk melihat sorotan.
              </p>
            ) : null}
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-2">
            {currentStep.allowSkip !== false ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={skip}
                className="text-outline hover:text-on-surface"
              >
                Lewati
              </Button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              {!isFirst ? (
                <Button variant="outline" size="sm" onClick={prev}>
                  Kembali
                </Button>
              ) : null}
              {currentStep.advance === "next-button" ? (
                <Button size="sm" onClick={next}>
                  {isLast ? "Selesai" : "Lanjut"}
                </Button>
              ) : (
                <span className="flex items-center gap-1.5 rounded-sm bg-surface-container px-3 py-1.5 text-xs font-medium text-secondary-fixed">
                  <MousePointerClick className="h-3.5 w-3.5" />
                  {currentStep.advance === "target-click"
                    ? "Klik elemen tersorot"
                    : "Menunggu…"}
                </span>
              )}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
