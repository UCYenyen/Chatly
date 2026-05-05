"use client";

import { useCallback, useState } from "react";
import type {
  ApiErrorResponse,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
} from "@/types/subscription.md";
import type { SubscriptionPlan } from "@prisma/client";

interface UseCheckoutResult {
  isPending: boolean;
  error: string | null;
  startCheckout: (plan: Exclude<SubscriptionPlan, "FREE">) => Promise<boolean>;
}

export function useCheckout(businessId?: string): UseCheckoutResult {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(
    async (plan: Exclude<SubscriptionPlan, "FREE">): Promise<boolean> => {
      if (!businessId) {
        setError("Business ID tidak ditemukan");
        return false;
      }
      setIsPending(true);
      setError(null);
      try {
        const payload: CreateSubscriptionRequest = { plan };
        const res = await fetch(`/api/businesses/${businessId}/subscription`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = (await res.json()) as ApiErrorResponse;
          throw new Error(body.message);
        }
        const json = (await res.json()) as CreateSubscriptionResponse;
        
        if (json.invoiceUrl) {
          window.location.href = json.invoiceUrl;
          return true;
        }

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memulai pembayaran");
        return false;
      } finally {
        setIsPending(false);
      }
    },
    [businessId],
  );

  return { isPending, error, startCheckout };
}
