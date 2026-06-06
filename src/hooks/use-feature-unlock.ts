"use client";

import { useCallback } from "react";
import { useSubscriptionContext } from "@/components/features/subscription/SubscriptionProvider";
import { hasFeature, resolveActivePlan } from "@/lib/utils/payment-gateway/plan-limits";
import { FEATURE_TUTORIALS } from "@/lib/feature-tutorials";
import type { BooleanFeatureKey } from "@/types/plan-limits.md";
import type { FeatureTutorial } from "@/types/feature-tutorial.md";

const ALL_BOOLEAN_FEATURES: ReadonlyArray<BooleanFeatureKey> = [
  "customPersonality",
  "advancedAnalytics",
  "dataExport",
  "slaSupport",
  "adminNotification",
];

interface UseFeatureUnlockResult {
  businessId: string | null;
  unlockedTutorials: FeatureTutorial[];
  availableTutorials: FeatureTutorial[];
  isLoading: boolean;
  markDone: () => Promise<void>;
}

export function useFeatureUnlock(): UseFeatureUnlockResult {
  const { data, isLoading, refresh } = useSubscriptionContext();
  const subscription = data?.subscription ?? null;
  const businessId = subscription?.businessId ?? null;
  const plan = resolveActivePlan(subscription?.plan, subscription?.status);
  const tutorialized = subscription?.tutorializedFeatures ?? [];

  const availableTutorials = FEATURE_TUTORIALS.filter((tutorial) =>
    hasFeature(plan, tutorial.feature),
  );

  const unlockedTutorials = availableTutorials.filter(
    (tutorial) => !tutorialized.includes(tutorial.feature),
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

  return { businessId, unlockedTutorials, availableTutorials, isLoading, markDone };
}
