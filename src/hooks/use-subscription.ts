"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  ApiErrorResponse,
  SubscriptionStateResponse,
} from "@/types/subscription.md";

interface UseSubscriptionResult {
  data: SubscriptionStateResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionResult {
  const [data, setData] = useState<SubscriptionStateResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions/me", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) {
        const body = (await res.json()) as ApiErrorResponse;
        throw new Error(body.message);
      }
      const json = (await res.json()) as SubscriptionStateResponse;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, isLoading, error, refresh };
}
