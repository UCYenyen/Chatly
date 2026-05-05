"use client";

import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { WhatsAppAuthDTO } from "@/types/whatsapp.md";

interface WhatsappAuthStatusProps {
  auth: WhatsAppAuthDTO | null;
  isLoading: boolean;
}

export function WhatsappAuthStatus({
  auth,
  isLoading,
}: WhatsappAuthStatusProps) {
  if (isLoading) {
    return (
      <Card className="bg-surface-container border-outline-variant/20">
        <CardContent className="flex items-center gap-3 p-4">
          <Clock className="w-5 h-5 text-outline animate-spin" />
          <span className="text-sm text-outline">Memuat status...</span>
        </CardContent>
      </Card>
    );
  }

  if (!auth) {
    return null;
  }

  const getStatusDisplay = () => {
    switch (auth.status) {
      case "AUTHENTICATED":
        return {
          icon: CheckCircle2,
          color: "text-green-600",
          bgColor: "bg-transparentc",
          label: "Terautentikasi",
          description: `Nomor: ${auth.phoneNumber || "Loading..."}`,
        };
      case "PENDING":
        return {
          icon: Clock,
          color: "text-foreground",
          bgColor: "bg-transparent",
          label: "Menunggu Autentikasi",
          description: "Silakan scan QR code",
        };
      case "EXPIRED":
        return {
          icon: AlertCircle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          label: "Sesi Berakhir",
          description: "Silakan login ulang",
        };
      case "DISCONNECTED":
        return {
          icon: AlertCircle,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          label: "Terputus",
          description: auth.disconnectedAt
            ? `Terputus pada ${new Date(auth.disconnectedAt).toLocaleString("id-ID")}`
            : "Koneksi hilang",
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-outline",
          bgColor: "bg-surface-container",
          label: "Status Tidak Diketahui",
          description: "",
        };
    }
  };

  const status = getStatusDisplay();
  const Icon = status.icon;

  return (
    <Card className={`border-outline-variant/20 ${status.bgColor}`}>
      <CardContent className="flex items-start gap-3 p-4">
        <Icon className={`w-5 h-5 mt-0.5 ${status.color}`} />
        <div className="flex flex-col gap-1">
          <p className={`text-sm font-medium ${status.color}`}>{status.label}</p>
          {status.description && (
            <p className="text-xs text-foreground/80">{status.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
