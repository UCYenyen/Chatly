"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useBusinesses } from "@/hooks/use-businesses";
import { useActiveBusiness } from "@/hooks/use-active-business";
import type { BusinessDTO } from "@/types/business.md";

interface BusinessContextValue {
  businesses: BusinessDTO[];
  activeBusiness: BusinessDTO | null;
  activeBusinessId: string | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setActiveBusinessId: (id: string | null) => void;
}

const BusinessContext = createContext<BusinessContextValue | null>(null);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { businesses, isLoading, error, refresh } = useBusinesses();
  const { activeBusiness, activeBusinessId, setActiveBusinessId } =
    useActiveBusiness(businesses);

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        activeBusiness,
        activeBusinessId,
        isLoading,
        error,
        refresh,
        setActiveBusinessId,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessContext(): BusinessContextValue {
  const ctx = useContext(BusinessContext);
  if (!ctx) {
    throw new Error("useBusinessContext must be used within <BusinessProvider>");
  }
  return ctx;
}
