"use client";

import { useEffect, useRef } from "react";

interface UseWhatsAppQrPollingOptions {
  businessId: string;
  isActive: boolean;
  onQrUpdate: (qrCode: string, expiry: string) => void;
  onAuthenticated: () => void;
  pollInterval?: number;
}

export function useWhatsAppQrPolling({
  businessId,
  isActive,
  onQrUpdate,
  onAuthenticated,
  pollInterval = 3000,
}: UseWhatsAppQrPollingOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/businesses/${businessId}/whatsapp/qr`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) return;

        const data = await res.json();

        if (data.status === "AUTHENTICATED") {
          onAuthenticated();
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        } else if (data.qrCode && data.qrCodeExpiry) {
          onQrUpdate(data.qrCode, data.qrCodeExpiry);
        }
      } catch (err) {
        console.error("QR polling error:", err);
      }
    };

    void poll();
    intervalRef.current = setInterval(poll, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [businessId, isActive, onQrUpdate, onAuthenticated, pollInterval]);
}
