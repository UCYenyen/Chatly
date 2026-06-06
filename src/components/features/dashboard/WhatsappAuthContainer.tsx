"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, AlertCircle } from "lucide-react";
import { useWhatsAppAuth } from "@/hooks/use-whatsapp-auth";
import { usePlanGate } from "@/hooks/use-plan-gate";
import { WhatsappChannelCard } from "./WhatsappChannelCard";
import { WhatsappIgnoreList } from "./WhatsappIgnoreList";
import { FeatureHelpButton } from "@/components/features/feature-unlock/FeatureHelpButton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface WhatsappAuthContainerProps {
  businessId: string;
}

export function WhatsappAuthContainer({
  businessId,
}: WhatsappAuthContainerProps) {
  const { channels, isLoading, error, addChannel, refreshChannelQr, logoutChannel, refetch } =
    useWhatsAppAuth(businessId);
  const { numericLimit, canAddMore } = usePlanGate();

  const [isAddingChannel, setIsAddingChannel] = useState(false);

  const channelLimit = numericLimit("channels");
  const canAdd = canAddMore("channels", channels.length);
  const hasAuthenticatedChannel = channels.some(c => c.status === "AUTHENTICATED");

  const handleAddChannel = async () => {
    setIsAddingChannel(true);
    try {
      const channelId = await addChannel();
      if (channelId) {
        void refetch();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add channel";
      toast.error(message);
    } finally {
      setIsAddingChannel(false);
    }
  };

  const handleDisconnect = async (channelId: string) => {
    try {
      await logoutChannel(channelId);
      toast.success("Channel disconnected successfully");
    } catch {
      toast.error("Failed to disconnect channel");
    }
  };

  const handleRefreshQr = async (channelId: string) => {
    try {
      await refreshChannelQr(channelId);
    } catch {
      toast.error("Failed to refresh QR code");
    }
  };

  const handleAuthSuccess = () => {
    void refetch();
  };

  const limitString = channelLimit === "unlimited" ? "∞" : String(channelLimit);

  return (
    <div className="flex flex-col gap-6 p-6 bg-surface-container rounded-lg border border-outline-variant/20">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-headline font-bold text-on-surface">
            Integrasi WhatsApp
          </h3>
          <p className="text-sm text-outline mt-1">
            Kelola koneksi WhatsApp untuk bisnis Anda
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-surface-container-high rounded-full border border-outline-variant/20 text-xs font-medium text-on-surface">
            {channels.length}/{limitString} channel
          </div>
          <FeatureHelpButton topic="whatsappSetup" />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-error-container rounded-lg border border-error">
          <AlertCircle className="w-5 h-5 text-error mt-0.5" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-8 px-6 rounded-lg border border-outline-variant/20 bg-surface-container-low">
          <div className="text-center">
            <h4 className="text-sm font-medium text-on-surface mb-2">
              Belum ada channel WhatsApp
            </h4>
            <p className="text-xs text-outline mb-4">
              Tambahkan channel pertama untuk mulai menerima pesan WhatsApp
            </p>
          </div>
          <Button
            onClick={handleAddChannel}
            disabled={!canAdd || isAddingChannel}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {isAddingChannel ? "Menambahkan..." : "Tambah Channel"}
          </Button>
          {!canAdd && (
            <p className="text-xs text-warning">
              Satu akun WhatsApp per bisnis.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {channels.map((channel) => (
            <WhatsappChannelCard
              key={channel.id}
              businessId={businessId}
              channel={channel}
              onDisconnect={handleDisconnect}
              onRefreshQr={handleRefreshQr}
              onAuthSuccess={handleAuthSuccess}
            />
          ))}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleAddChannel}
              disabled={!canAdd || isAddingChannel}
              variant="outline"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              {isAddingChannel ? "Menambahkan..." : "Tambah Channel"}
            </Button>
            {!canAdd && (
              <div className="flex items-center gap-2 text-xs text-warning">
                <AlertCircle className="w-4 h-4" />
                <span>Satu akun WhatsApp per bisnis.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {hasAuthenticatedChannel && <WhatsappIgnoreList businessId={businessId} />}
    </div>
  );
}
