"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseWhatsAppQrPollingOptions {
  businessId: string;
  isActive: boolean;
  onQrUpdate: (qrCode: string, expiry: string) => void;
  onAuthenticated: () => void;
  onExpired?: () => void;
  pollInterval?: number;
}

/**
 * Polls GET /api/businesses/:id/whatsapp/status to detect when the
 * user has scanned the QR code and the device is logged in.
 *
 * This endpoint calls Gowa's /devices/:device_id/status in real-time,
 * so the frontend doesn't need to talk to Gowa directly.
 */
export function useWhatsAppQrPolling({
  businessId,
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

  // Keep refs current to avoid stale closures in the interval
  onAuthenticatedRef.current = onAuthenticated;
  onQrUpdateRef.current = onQrUpdate;
  onExpiredRef.current = onExpired;

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
          `/api/businesses/${businessId}/whatsapp/status`,
          { credentials: "include" }
        );
        if (!res.ok) return;

        const data = await res.json();
        const auth = data.auth;

        if (!auth) return;

        if (auth.status === "AUTHENTICATED") {
          clearPoll();
          onAuthenticatedRef.current();
          return;
        }

        if (auth.status === "EXPIRED") {
          clearPoll();
          onExpiredRef.current?.();
          return;
        }

        // Still PENDING — pass the QR code to the display
        if (auth.status === "PENDING" && auth.qrCode && auth.qrCodeExpiry) {
          onQrUpdateRef.current(auth.qrCode, auth.qrCodeExpiry);
        }
      } catch (err) {
        console.error("QR polling error:", err);
      }
    };

    // Poll immediately, then every pollInterval
    void poll();
    intervalRef.current = setInterval(poll, pollInterval);

    return () => clearPoll();
  }, [businessId, isActive, pollInterval, clearPoll]);
}
