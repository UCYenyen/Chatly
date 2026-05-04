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
  startCheckout: (plan: Exclude<SubscriptionPlan, "FREE">) => Promise<void>;
}

export function useCheckout(): UseCheckoutResult {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(
    async (plan: Exclude<SubscriptionPlan, "FREE">): Promise<void> => {
      setIsPending(true);
      setError(null);
      try {
        const payload: CreateSubscriptionRequest = { plan };
        const res = await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = (await res.json()) as ApiErrorResponse;
          throw new Error(body.message);
        }
        const json = (await res.json()) as CreateSubscriptionResponse;
        window.location.href = json.invoiceUrl;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memulai pembayaran");
        setIsPending(false);
      }
    },
    [],
  );

  return { isPending, error, startCheckout };
}
