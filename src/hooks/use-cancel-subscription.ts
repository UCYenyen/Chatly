"use client";

import { useCallback, useState } from "react";
import type { ApiErrorResponse } from "@/types/subscription.md";

interface UseCancelSubscriptionResult {
  isPending: boolean;
  error: string | null;
  cancel: () => Promise<boolean>;
}

export function useCancelSubscription(businessId?: string): UseCancelSubscriptionResult {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = useCallback(async (): Promise<boolean> => {
    if (!businessId) {
      setError("Business ID tidak ditemukan");
      return false;
    }
    setIsPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/businesses/${businessId}/subscription/cancel`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = (await res.json()) as ApiErrorResponse;
        throw new Error(body.message);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membatalkan langganan");
      return false;
    } finally {
      setIsPending(false);
    }
  }, [businessId]);

  return { isPending, error, cancel };
}
