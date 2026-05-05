"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  WhatsAppAuthDTO,
  WhatsAppAuthType,
  InitWhatsAppAuthResponse,
} from "@/types/whatsapp.md";

interface UseWhatsAppAuthResult {
  auth: WhatsAppAuthDTO | null;
  isLoading: boolean;
  error: string | null;
  initAuth: (authType: WhatsAppAuthType) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useWhatsAppAuth(
  businessId: string
): UseWhatsAppAuthResult {
  const [auth, setAuth] = useState<WhatsAppAuthDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/businesses/${businessId}/whatsapp/status`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch WhatsApp status");
      }
      const data = await res.json();
      setAuth(data.auth);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  const initAuth = useCallback(
    async (authType: WhatsAppAuthType) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/businesses/${businessId}/whatsapp/init`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ authType }),
            credentials: "include",
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || "Failed to initialize WhatsApp"
          );
        }
        const data: InitWhatsAppAuthResponse = await res.json();
        setAuth((prev) =>
          prev
            ? { ...prev, qrCode: data.qrCode, qrCodeExpiry: data.qrCodeExpiry }
            : null
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [businessId]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/businesses/${businessId}/whatsapp/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to logout");
      }
      await fetchAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [businessId, fetchAuth]);

  useEffect(() => {
    void fetchAuth();
  }, [fetchAuth]);

  return {
    auth,
    isLoading,
    error,
    initAuth,
    logout,
    refetch: fetchAuth,
  };
}
