"use client";

import { useCallback, useEffect, useState } from "react";
import type { BusinessDTO, BusinessListResponse } from "@/types/business.md";

interface ApiError {
  message: string;
}

interface UseBusinessesResult {
  businesses: BusinessDTO[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBusinesses(): UseBusinessesResult {
  const [businesses, setBusinesses] = useState<BusinessDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/businesses", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        const body = (await res.json()) as ApiError;
        throw new Error(body.message);
      }
      const json = (await res.json()) as BusinessListResponse;
      setBusinesses(json.businesses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat bisnis");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { businesses, isLoading, error, refresh };
}
