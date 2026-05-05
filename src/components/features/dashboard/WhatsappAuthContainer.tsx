"use client";

import { useState } from "react";
import type { WhatsAppAuthType } from "@/types/whatsapp.md";
import { useWhatsAppAuth } from "@/hooks/use-whatsapp-auth";
import { WhatsappAuthTypeSelector } from "./WhatsappAuthTypeSelector";
import { WhatsappQrDisplay } from "./WhatsappQrDisplay";
import { WhatsappAuthStatus } from "./WhatsappAuthStatus";
import { WhatsappLogoutButton } from "./WhatsappLogoutButton";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface WhatsappAuthContainerProps {
  businessId: string;
}

export function WhatsappAuthContainer({
  businessId,
}: WhatsappAuthContainerProps) {
  const { auth, isLoading, error, initAuth, logout, refetch } =
    useWhatsAppAuth(businessId);
  const [selectedType, setSelectedType] = useState<WhatsAppAuthType | null>(
    auth?.authType ?? null
  );
  const [isWaitingForAuth, setIsWaitingForAuth] = useState(false);

  const handleSelectType = async (type: WhatsAppAuthType) => {
    setSelectedType(type);
    try {
      await initAuth(type);
      setIsWaitingForAuth(true);
    } catch (err) {
      console.error("Failed to initialize auth:", err);
    }
  };

  const handleAuthSuccess = () => {
    setIsWaitingForAuth(false);
    void refetch();
  };

  const handleRefresh = async () => {
    await initAuth(selectedType || "GOWA");
  };

  const isAuthenticated = auth?.status === "AUTHENTICATED";

  return (
    <div className="flex flex-col gap-6 p-6 bg-surface-container rounded-lg border border-outline-variant/20">
      <div>
        <h3 className="text-lg font-headline font-bold text-on-surface">
          Integrasi WhatsApp
        </h3>
        <p className="text-sm text-outline mt-1">
          Kelola koneksi WhatsApp untuk bisnis Anda
        </p>
      </div>

      <WhatsappAuthStatus auth={auth} isLoading={isLoading} />

      {error && !isWaitingForAuth && (
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!isAuthenticated && !isWaitingForAuth && (
        <WhatsappAuthTypeSelector
          selectedType={selectedType}
          onSelect={handleSelectType}
          isLoading={isLoading}
        />
      )}

      {isWaitingForAuth && (
        <WhatsappQrDisplay
          businessId={businessId}
          isWaitingForAuth={isWaitingForAuth}
          onAuthSuccess={handleAuthSuccess}
          onRefresh={handleRefresh}
        />
      )}

      <div className="flex gap-2 justify-end flex-wrap">
        {isWaitingForAuth && (
          <Button
            onClick={() => setIsWaitingForAuth(false)}
            variant="outline"
            disabled={isLoading}
          >
            Batal
          </Button>
        )}
        <WhatsappLogoutButton
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          onLogout={logout}
        />
      </div>
    </div>
  );
}
