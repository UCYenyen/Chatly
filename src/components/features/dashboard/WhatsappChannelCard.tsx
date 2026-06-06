"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Clock, Trash2 } from "lucide-react";
import type { WhatsAppAuthDTO } from "@/types/whatsapp.md";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { WhatsappQrDisplay } from "./WhatsappQrDisplay";

interface WhatsappChannelCardProps {
  businessId: string;
  channel: WhatsAppAuthDTO;
  onDisconnect: (channelId: string) => Promise<void>;
  onRefreshQr: (channelId: string) => Promise<void>;
  onAuthSuccess: () => void;
}

export function WhatsappChannelCard({
  businessId,
  channel,
  onDisconnect,
  onRefreshQr,
  onAuthSuccess,
}: WhatsappChannelCardProps) {
  const [isShowingQr, setIsShowingQr] = useState(channel.status === "PENDING");
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await onDisconnect(channel.id);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleRefresh = async () => {
    await onRefreshQr(channel.id);
  };

  const getStatusDisplay = () => {
    switch (channel.status) {
      case "AUTHENTICATED":
        return {
          icon: CheckCircle2,
          color: "text-success",
          label: "Terautentikasi",
          description: `Nomor: ${channel.phoneNumber || "..."}`,
        };
      case "PENDING":
        return {
          icon: Clock,
          color: "text-foreground",
          label: "Menunggu Autentikasi",
          description: "Silakan scan QR code",
        };
      case "EXPIRED":
        return {
          icon: AlertCircle,
          color: "text-error",
          label: "Sesi Berakhir",
          description: "Silakan login ulang",
        };
      case "DISCONNECTED":
        return {
          icon: AlertCircle,
          color: "text-warning",
          label: "Terputus",
          description: channel.disconnectedAt
            ? `Terputus pada ${new Date(channel.disconnectedAt).toLocaleString("id-ID")}`
            : "Koneksi hilang",
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-outline",
          label: "Status Tidak Diketahui",
          description: "",
        };
    }
  };

  const status = getStatusDisplay();
  const Icon = status.icon;

  return (
    <Card className="border-outline-variant/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Icon className={`w-5 h-5 mt-0.5 ${status.color}`} />
            <div className="flex flex-col gap-1">
              <CardTitle className={`text-sm ${status.color}`}>
                {status.label}
              </CardTitle>
              <p className="text-xs text-foreground/80">
                {status.description}
              </p>
            </div>
          </div>
          {channel.status === "AUTHENTICATED" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isDisconnecting}
                  aria-label="Disconnect channel"
                >
                  <Trash2 className="w-4 h-4 text-error" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Putuskan Channel?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Channel WhatsApp untuk nomor {channel.phoneNumber} akan
                    dihapus dan bot akan berhenti merespons dari nomor ini.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-2 justify-end">
                  <AlertDialogCancel disabled={isDisconnecting}>
                    Batal
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDisconnect}
                    disabled={isDisconnecting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDisconnecting ? "Memutuskan..." : "Putuskan"}
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>

      {isShowingQr && (
        <CardContent>
          <WhatsappQrDisplay
            businessId={businessId}
            channelId={channel.id}
            isWaitingForAuth={isShowingQr}
            onAuthSuccess={() => {
              setIsShowingQr(false);
              onAuthSuccess();
            }}
            onRefresh={handleRefresh}
          />
        </CardContent>
      )}

      {!isShowingQr && (channel.status === "EXPIRED" || channel.status === "DISCONNECTED") && (
        <CardContent>
          <Button
            onClick={() => setIsShowingQr(true)}
            className="w-full"
            variant="outline"
          >
            Reconnect
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
