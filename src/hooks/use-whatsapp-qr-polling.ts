"use client";

import { useEffect, useRef, useCallback } from "react";

interface QrPollingResponse {
  status: string;
  qrCode?: string;
  qrCodeExpiry?: string;
  phoneNumber?: string;
}

interface UseWhatsAppQrPollingOptions {
  businessId: string;
  channelId: string;
  isActive: boolean;
  onQrUpdate: (qrCode: string, expiry: string) => void;
  onAuthenticated: () => void;
  onExpired?: () => void;
  pollInterval?: number;
}

export function useWhatsAppQrPolling({
  businessId,
  channelId,
  isActive,
  onQrUpdate,
  onAuthenticated,
  onExpired,
  pollInterval = 3000,
}: UseWhatsAppQrPollingOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onAuthenticatedRef = useRef(onAuthenticated);
  const onQrUpdateRef = useRef(onQrUpdate);
  const onExpiredRef = useRef(onExpired);

  useEffect(() => {
    onAuthenticatedRef.current = onAuthenticated;
    onQrUpdateRef.current = onQrUpdate;
    onExpiredRef.current = onExpired;
  }, [onAuthenticated, onQrUpdate, onExpired]);

  const clearPoll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isActive) {
      clearPoll();
      return;
    }

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/businesses/${businessId}/whatsapp/qr?channelId=${channelId}`,
          { credentials: "include" }
        );
        if (!res.ok) return;

        const data: QrPollingResponse = await res.json();

        if (data.status === "AUTHENTICATED") {
          clearPoll();
          onAuthenticatedRef.current();
          return;
        }

        if (data.status === "EXPIRED") {
          clearPoll();
          onExpiredRef.current?.();
          return;
        }

        if (
          data.status === "PENDING" &&
          data.qrCode &&
          data.qrCodeExpiry
        ) {
          onQrUpdateRef.current(data.qrCode, data.qrCodeExpiry);
        }
      } catch (err) {
        console.error("QR polling error:", err);
      }
    };

    void poll();
    intervalRef.current = setInterval(poll, pollInterval);

    return () => clearPoll();
  }, [businessId, channelId, isActive, pollInterval, clearPoll]);
}
