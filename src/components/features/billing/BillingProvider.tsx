"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSubscription } from "@/hooks/use-subscription";
import type { SubscriptionStateResponse } from "@/types/subscription.md";

interface BillingContextValue {
  data: SubscriptionStateResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const BillingContext = createContext<BillingContextValue | null>(null);

export function BillingProvider({ children }: { children: ReactNode }) {
  const value = useSubscription();
  const { refresh } = value;
  const router = useRouter();
  const searchParams = useSearchParams();
  const handledRef = useRef<boolean>(false);

  useEffect(() => {
    if (handledRef.current) return;
    const ext = searchParams.get("ext");
    const paid = searchParams.get("paid");
    if (!ext || paid !== "1") return;

    handledRef.current = true;
    (async () => {
      try {
        await fetch("/api/subscriptions/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ externalId: ext }),
        });
      } finally {
        await refresh();
        router.replace("/billing");
      }
    })();
  }, [searchParams, refresh, router]);

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling(): BillingContextValue {
  const ctx = useContext(BillingContext);
  if (!ctx) {
    throw new Error("useBilling must be used within <BillingProvider>");
  }
  return ctx;
}
