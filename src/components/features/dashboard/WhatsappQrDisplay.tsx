"use client";

import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWhatsAppQrPolling } from "@/hooks/use-whatsapp-qr-polling";

interface WhatsappQrDisplayProps {
  businessId: string;
  isWaitingForAuth: boolean;
  onAuthSuccess: () => void;
  onRefresh: () => Promise<void>;
}

export function WhatsappQrDisplay({
  businessId,
  isWaitingForAuth,
  onAuthSuccess,
  onRefresh,
}: WhatsappQrDisplayProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useWhatsAppQrPolling({
    businessId,
    isActive: isWaitingForAuth,
    onQrUpdate: (newQr) => {
      setQrCode(newQr);
    },
    onAuthenticated: () => {
      onAuthSuccess();
      setQrCode(null);
    },
    pollInterval: 3000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isWaitingForAuth) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 items-center p-6 bg-surface-container rounded-lg border border-outline-variant/20">
      <p className="text-sm font-medium text-on-surface text-center">
        Scan QR Code menggunakan WhatsApp untuk autentikasi
      </p>

      {qrCode ? (
        <div className="flex flex-col gap-4 items-center">
          <div className="p-4 bg-white rounded-lg">
            {qrCode.trim().startsWith("<svg") ? (
              <div dangerouslySetInnerHTML={{ __html: qrCode }} />
            ) : (
              <img
                src={
                  qrCode.startsWith("data:") || qrCode.startsWith("http")
                    ? qrCode
                    : `data:image/png;base64,${qrCode}`
                }
                alt="WhatsApp QR Code"
                className="w-64 h-64"
              />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-outline">
            <AlertCircle className="w-4 h-4" />
            <span>QR Code berlaku 2 menit. Jika expired, refresh untuk mendapatkan yang baru.</span>
          </div>
        </div>
      ) : (
        <div className="w-40 h-40 bg-surface-container-high rounded-lg flex items-center justify-center">
          <p className="text-sm text-outline">Menghasilkan QR Code...</p>
        </div>
      )}

      <Button
        onClick={handleRefresh}
        disabled={isRefreshing}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        Refresh QR Code
      </Button>
    </div>
  );
}
