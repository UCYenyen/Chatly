"use client";

import { useCallback, useState } from "react";
import type {
  BusinessDTO,
  CreateBusinessRequest,
} from "@/types/business.md";

interface ApiError {
  message: string;
}

interface UseCreateBusinessResult {
  isPending: boolean;
  error: string | null;
  createBusiness: (input: CreateBusinessRequest) => Promise<BusinessDTO | null>;
}

export function useCreateBusiness(): UseCreateBusinessResult {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createBusiness = useCallback(
    async (input: CreateBusinessRequest): Promise<BusinessDTO | null> => {
      setIsPending(true);
      setError(null);
      try {
        const res = await fetch("/api/businesses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(input),
        });
        if (!res.ok) {
          const body = (await res.json()) as ApiError;
          throw new Error(body.message);
        }
        return (await res.json()) as BusinessDTO;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal membuat bisnis");
        return null;
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  return { isPending, error, createBusiness };
}
