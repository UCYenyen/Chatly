"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useBusinessContext } from "@/components/features/business/BusinessProvider";
import { useTour } from "./TourProvider";

export function TourBusinessDriver() {
  const router = useRouter();
  const { isActive, currentStep, next } = useTour();
  const { businesses, activeBusinessId, setActiveBusinessId } =
    useBusinessContext();
  const handledRef = useRef(false);

  useEffect(() => {
    if (!isActive || currentStep?.id !== "select-business") {
      handledRef.current = false;
      return;
    }
    if (handledRef.current || businesses.length === 0) return;

    handledRef.current = true;
    const targetId = activeBusinessId ?? businesses[0].id;
    setActiveBusinessId(targetId);
    router.push(`/business/${targetId}/ringkasan`);
    next();
  }, [
    isActive,
    currentStep,
    businesses,
    activeBusinessId,
    setActiveBusinessId,
    next,
    router,
  ]);

  return null;
}
