"use client";

import { useCallback, useEffect, useState } from "react";
import type { SubscriptionPlan } from "@prisma/client";

interface UseBusinessSubscriptionResult {
  plan: SubscriptionPlan | null;
  isLoading: boolean;
  error: string | null;
  isPaid: boolean;
  refresh: () => Promise<void>;
}

export function useBusinessSubscription(businessId?: string): UseBusinessSubscriptionResult {
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/businesses/${businessId}/subscription`, {
        method: "GET",
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Gagal memuat subscription");
      }
      const data = await res.json() as { subscription: { plan: SubscriptionPlan } | null };
      setPlan(data.subscription?.plan ?? "FREE");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading subscription");
      setPlan("FREE");
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    plan,
    isLoading,
    error,
    isPaid: plan !== null && plan !== "FREE",
    refresh,
  };
}
