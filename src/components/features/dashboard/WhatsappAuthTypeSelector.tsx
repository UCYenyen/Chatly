"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle } from "lucide-react";
import type { WhatsAppAuthType } from "@/types/whatsapp.md";

interface WhatsappAuthTypeSelectorProps {
  selectedType: WhatsAppAuthType | null;
  onSelect: (type: WhatsAppAuthType) => void;
  isLoading: boolean;
}

export function WhatsappAuthTypeSelector({
  selectedType,
  onSelect,
  isLoading,
}: WhatsappAuthTypeSelectorProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-on-surface">
        Pilih metode autentikasi WhatsApp
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          onClick={() => onSelect("GOWA")}
          disabled={isLoading}
          variant={selectedType === "GOWA" ? "default" : "outline"}
          className="h-auto flex flex-col gap-2 p-4 items-start justify-start"
        >
          <div className="flex items-center gap-2 w-full">
            {selectedType === "GOWA" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
            <span>GoWa API</span>
          </div>
          <span className={`text-xs text-left` + selectedType==="GOWA" ? "text-white" : "text-background"}>
            API alternatif WhatsApp dengan QR code scanning
          </span>
        </Button>

        <Button
          onClick={() => onSelect("OFFICIAL")}
          disabled={true}
          variant={selectedType === "OFFICIAL" ? "default" : "outline"}
          className="h-auto flex flex-col gap-2 p-4 items-start justify-start opacity-50"
        >
          <div className="flex items-center gap-2 w-full">
            {selectedType === "OFFICIAL" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
            <span>WhatsApp Official API</span>
          </div>
          <span className="text-xs text-outline text-left">
            Segera hadir (Coming soon)
          </span>
        </Button>
      </div>
    </div>
  );
}
