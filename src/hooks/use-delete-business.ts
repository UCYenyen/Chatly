"use client";

import { useCallback, useState } from "react";

interface ApiError {
  message: string;
}

interface UseDeleteBusinessResult {
  isPending: boolean;
  error: string | null;
  deleteBusiness: (id: string) => Promise<boolean>;
}

export function useDeleteBusiness(): UseDeleteBusinessResult {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBusiness = useCallback(async (id: string): Promise<boolean> => {
    setIsPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/businesses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const body = (await res.json()) as ApiError;
        throw new Error(body.message);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus bisnis");
      return false;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { isPending, error, deleteBusiness };
}
