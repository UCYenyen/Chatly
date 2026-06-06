"use client";

import { useCallback, useState } from "react";
import type {
  ApiErrorResponse,
  CheckoutResult,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
} from "@/types/subscription.md";
import type { SubscriptionPlan } from "@prisma/client";

interface UseCheckoutResult {
  isPending: boolean;
  error: string | null;
  startCheckout: (plan: Exclude<SubscriptionPlan, "FREE">) => Promise<CheckoutResult>;
}

export function useCheckout(businessId?: string): UseCheckoutResult {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(
    async (plan: Exclude<SubscriptionPlan, "FREE">): Promise<CheckoutResult> => {
      if (!businessId) {
        const message = "Business ID tidak ditemukan";
        setError(message);
        return { ok: false, message };
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
        }

        return { ok: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Gagal memulai pembayaran";
        setError(message);
        return { ok: false, message };
      } finally {
        setIsPending(false);
      }
    },
    [businessId],
  );

  return { isPending, error, startCheckout };
}
