"use client";

import { useCallback, useState } from "react";
import type { ApiErrorResponse } from "@/types/subscription.md";

interface UseCancelPaymentResult {
  pendingId: string | null;
  error: string | null;
  cancelPayment: (paymentId: string) => Promise<boolean>;
}

export function useCancelPayment(): UseCancelPaymentResult {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cancelPayment = useCallback(async (paymentId: string): Promise<boolean> => {
    setPendingId(paymentId);
    setError(null);
    try {
      const res = await fetch(`/api/payments/${paymentId}/cancel`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const body = (await res.json()) as ApiErrorResponse;
        throw new Error(body.message);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membatalkan transaksi");
      return false;
    } finally {
      setPendingId(null);
    }
  }, []);

  return { pendingId, error, cancelPayment };
}
