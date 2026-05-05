import { useState } from "react";
import type { BusinessDTO, UpdateBusinessRequest } from "@/types/business.md";

export function useUpdateBusiness(businessId: string | null) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBusiness = async (data: UpdateBusinessRequest): Promise<BusinessDTO | null> => {
    if (!businessId) {
      setError("Business ID is missing");
      return null;
    }

    setIsPending(true);
    setError(null);

    try {
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update business");
      }

      return await res.json();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setError(msg);
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { updateBusiness, isPending, error };
}
