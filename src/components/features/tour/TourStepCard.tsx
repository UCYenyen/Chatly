"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
import type { TourPlacement } from "@/types/tour.md";
import { useTour } from "./TourProvider";
import { matchTourRoute } from "./tour-steps";

const CARD_OFFSET = 18;
const VIEWPORT_MARGIN = 12;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface Size {
  width: number;
  height: number;
}

interface Position {
  left: number;
  top: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function findVisibleTarget(selector: string): Element | null {
  const elements = Array.from(document.querySelectorAll(selector));
  const visible = elements.find((element) => {
    const box = element.getBoundingClientRect();
    return box.width > 0 && box.height > 0;
  });
  return visible ?? elements[0] ?? null;
}

function computePosition(
  rect: DOMRect | null,
  placement: TourPlacement,
  card: Size,
  viewportWidth: number,
  viewportHeight: number,
): Position {
  let left: number;
  let top: number;

  if (!rect || placement === "center") {
    left = (viewportWidth - card.width) / 2;
    top = (viewportHeight - card.height) / 2;
  } else {
    switch (placement) {
      case "right":
        left = rect.right + CARD_OFFSET;
        top = rect.top + rect.height / 2 - card.height / 2;
        break;
      case "left":
        left = rect.left - CARD_OFFSET - card.width;
        top = rect.top + rect.height / 2 - card.height / 2;
        break;
      case "top":
        left = rect.left + rect.width / 2 - card.width / 2;
        top = rect.top - CARD_OFFSET - card.height;
        break;
      default:
        left = rect.left + rect.width / 2 - card.width / 2;
        top = rect.bottom + CARD_OFFSET;
        break;
    }
  }

  return {
    left: clamp(
      left,
      VIEWPORT_MARGIN,
      Math.max(VIEWPORT_MARGIN, viewportWidth - card.width - VIEWPORT_MARGIN),
    ),
    top: clamp(
      top,
      VIEWPORT_MARGIN,
      Math.max(VIEWPORT_MARGIN, viewportHeight - card.height - VIEWPORT_MARGIN),
    ),
  };
}

export function TourStepCard() {
  const { isActive, currentStep, state, steps, next, prev, skip } = useTour();
  const pathname = usePathname();

  const routeMatches = currentStep
    ? matchTourRoute(currentStep.route, pathname)
    : false;

  const cardRef = useRef<HTMLDivElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!isActive || !currentStep) return;
    const selector = currentStep.targetSelector;
    const placement = currentStep.placement;
    let frame = 0;

    const tick = (): void => {
      const element = cardRef.current;
      if (element) {
        const cardBox = element.getBoundingClientRect();
        const targetElement =
          routeMatches && selector ? findVisibleTarget(selector) : null;
        const targetRect = targetElement
          ? targetElement.getBoundingClientRect()
          : null;
        const position = computePosition(
          targetRect,
          placement,
          { width: cardBox.width, height: cardBox.height },
          window.innerWidth,
          window.innerHeight,
        );
        element.style.left = `${position.left}px`;
        element.style.top = `${position.top}px`;
      }
      frame = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(frame);
  }, [isActive, currentStep, routeMatches]);

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
  if (typeof document === "undefined") return null;

  const stepNumber = state.stepIndex + 1;
  const totalSteps = steps.length;
  const isLast = state.stepIndex === totalSteps - 1;
  const isFirst = state.stepIndex === 0;

  const content = (
    <div
      ref={cardRef}
      className="pointer-events-auto fixed left-0 top-0 z-111 w-[min(360px,90vw)]"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
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
              <Progress
                value={(stepNumber / totalSteps) * 100}
                className="h-1.5"
              />
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
    </div>
  );

  return createPortal(content, document.body);
}
