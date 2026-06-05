"use client";

import { useState } from "react";
import type { OnboardingStatusResponse } from "@/types/tour.md";

export function useOnboardingStatus() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getOnboardingStatus = async (): Promise<boolean | null> => {
    setIsPending(true);
    setError(null);
    try {
      const res = await fetch("/api/me/onboarding");
      if (!res.ok) throw new Error("Gagal memuat status onboarding");
      const data = (await res.json()) as OnboardingStatusResponse;
      return data.onboardingCompleted;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      return null;
    } finally {
      setIsPending(false);
    }
  };

  const setOnboardingCompleted = async (
    completed: boolean,
  ): Promise<boolean | null> => {
    setIsPending(true);
    setError(null);
    try {
      const res = await fetch("/api/me/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingCompleted: completed }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui status onboarding");
      const data = (await res.json()) as OnboardingStatusResponse;
      return data.onboardingCompleted;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { getOnboardingStatus, setOnboardingCompleted, isPending, error };
}
