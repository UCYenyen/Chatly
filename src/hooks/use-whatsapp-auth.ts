"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  WhatsAppAuthDTO,
  InitWhatsAppAuthResponse,
  WhatsAppStatusResponse,
} from "@/types/whatsapp.md";

interface PlanLimitErrorResponse {
  message: string;
  code: string;
}

interface UseWhatsAppAuthResult {
  channels: WhatsAppAuthDTO[];
  isLoading: boolean;
  error: string | null;
  addChannel: () => Promise<string | null>;
  refreshChannelQr: (channelId: string) => Promise<void>;
  logoutChannel: (channelId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useWhatsAppAuth(
  businessId: string
): UseWhatsAppAuthResult {
  const [channels, setChannels] = useState<WhatsAppAuthDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
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
      const data: WhatsAppStatusResponse = await res.json();
      setChannels(data.channels);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  const addChannel = useCallback(async (): Promise<string | null> => {
    setError(null);
    try {
      const res = await fetch(
        `/api/businesses/${businessId}/whatsapp/init`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authType: "GOWA" }),
          credentials: "include",
        }
      );
      if (!res.ok) {
        const errorData: PlanLimitErrorResponse = await res.json();
        const message =
          errorData.message || "Failed to initialize WhatsApp channel";
        setError(message);
        throw new Error(message);
      }
      const data: InitWhatsAppAuthResponse = await res.json();
      await fetchStatus();
      return data.channelId;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    }
  }, [businessId, fetchStatus]);

  const refreshChannelQr = useCallback(
    async (channelId: string) => {
      setError(null);
      try {
        const res = await fetch(
          `/api/businesses/${businessId}/whatsapp/init`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ authType: "GOWA", channelId }),
            credentials: "include",
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || "Failed to refresh QR code"
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      }
    },
    [businessId]
  );

  const logoutChannel = useCallback(
    async (channelId: string) => {
      setError(null);
      try {
        const res = await fetch(
          `/api/businesses/${businessId}/whatsapp/logout`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channelId }),
            credentials: "include",
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to logout");
        }
        await fetchStatus();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      }
    },
    [businessId, fetchStatus]
  );

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  return {
    channels,
    isLoading,
    error,
    addChannel,
    refreshChannelQr,
    logoutChannel,
    refetch: fetchStatus,
  };
}
