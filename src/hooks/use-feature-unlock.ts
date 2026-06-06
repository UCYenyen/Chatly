"use client";

import { useCallback } from "react";
import { useSubscriptionContext } from "@/components/features/subscription/SubscriptionProvider";
import { useBusinessContext } from "@/components/features/business/BusinessProvider";
import { hasFeature, resolveActivePlan } from "@/lib/utils/payment-gateway/plan-limits";
import { TUTORIALS, getTutorialById } from "@/lib/feature-tutorials";
import type { BooleanFeatureKey } from "@/types/plan-limits.md";
import type { Tutorial } from "@/types/feature-tutorial.md";

const ALL_BOOLEAN_FEATURES: ReadonlyArray<BooleanFeatureKey> = [
  "customPersonality",
  "advancedAnalytics",
  "dataExport",
  "slaSupport",
  "adminNotification",
];

interface UseFeatureUnlockResult {
  businessId: string | null;
  unlockedTutorials: Tutorial[];
  availableTutorials: Tutorial[];
  isLoading: boolean;
  isTutorialAvailable: (id: string) => boolean;
  markDone: () => Promise<void>;
}

export function useFeatureUnlock(): UseFeatureUnlockResult {
  const { data, isLoading, refresh } = useSubscriptionContext();
  const { activeBusinessId } = useBusinessContext();
  const subscription = data?.subscription ?? null;
  const businessId = activeBusinessId ?? subscription?.businessId ?? null;
  const plan = resolveActivePlan(subscription?.plan, subscription?.status);
  const tutorialized = subscription?.tutorializedFeatures ?? [];

  const availableTutorials = TUTORIALS.filter(
    (tutorial) => tutorial.feature && hasFeature(plan, tutorial.feature),
  );

  const unlockedTutorials = availableTutorials.filter(
    (tutorial) => !tutorial.feature || !tutorialized.includes(tutorial.feature),
  );

  const isTutorialAvailable = useCallback(
    (id: string): boolean => {
      const tutorial = getTutorialById(id);
      if (!tutorial) return false;
      if (!tutorial.feature) return true;
      return hasFeature(plan, tutorial.feature);
    },
    [plan],
  );

  const markDone = useCallback(async (): Promise<void> => {
    if (!businessId) return;
    const currentFeatures = ALL_BOOLEAN_FEATURES.filter((key) =>
      hasFeature(plan, key),
    );
    try {
      await fetch(`/api/businesses/${businessId}/subscription/tutorialized`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: currentFeatures }),
      });
    } catch (error) {
      console.error("[feature-unlock] Gagal menyimpan status tutorial:", error);
    } finally {
      await refresh();
    }
  }, [businessId, plan, refresh]);

  return {
    businessId,
    unlockedTutorials,
    availableTutorials,
    isLoading,
    isTutorialAvailable,
    markDone,
  };
}
