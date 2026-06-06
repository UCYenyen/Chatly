"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, QrCode, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { WhatsAppAuthType } from "@/types/whatsapp.md";

interface WhatsappConnectMethodDialogProps {
  triggerLabel: string;
  triggerVariant?: "default" | "outline";
  disabled?: boolean;
  isAdding?: boolean;
  onConnectQr: () => void;
}

export function WhatsappConnectMethodDialog({
  triggerLabel,
  triggerVariant = "default",
  disabled = false,
  isAdding = false,
  onConnectQr,
}: WhatsappConnectMethodDialogProps) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<WhatsAppAuthType>("GOWA");

  const handleContinue = () => {
    if (method === "OFFICIAL") {
      toast.info("Integrasi WhatsApp Business API akan segera hadir.");
      return;
    }
    setOpen(false);
    onConnectQr();
  };

  const optionClass = (value: WhatsAppAuthType): string => {
    const base =
      "flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors";
    return method === value
      ? `${base} border-primary bg-surface-container-low`
      : `${base} border-outline-variant hover:border-outline`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} disabled={disabled} className="gap-2">
          <Plus className="w-4 h-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hubungkan WhatsApp</DialogTitle>
          <DialogDescription>
            Pilih cara menghubungkan akun WhatsApp bisnis Anda.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={method}
          onValueChange={(value) => setMethod(value as WhatsAppAuthType)}
          className="flex flex-col gap-3"
        >
          <Label htmlFor="method-gowa" className={optionClass("GOWA")}>
            <RadioGroupItem value="GOWA" id="method-gowa" className="mt-1" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <QrCode className="size-4 text-primary" />
                <span className="text-sm font-medium text-on-surface">
                  Pindai Kode QR
                </span>
              </div>
              <span className="text-xs text-outline">
                Hubungkan dengan memindai kode QR dari aplikasi WhatsApp di ponsel
                Anda. Cepat dan tanpa biaya tambahan.
              </span>
            </div>
          </Label>

          <Label htmlFor="method-official" className={optionClass("OFFICIAL")}>
            <RadioGroupItem
              value="OFFICIAL"
              id="method-official"
              className="mt-1"
            />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                <span className="text-sm font-medium text-on-surface">
                  WhatsApp Business API
                </span>
                <Badge variant="outline" className="text-[10px]">
                  Segera hadir
                </Badge>
              </div>
              <span className="text-xs text-outline">
                Hubungkan melalui akun resmi WhatsApp Business API (Cloud API)
                untuk skala lebih besar dan centang hijau resmi.
              </span>
            </div>
          </Label>
        </RadioGroup>

        <DialogFooter>
          <Button onClick={handleContinue} disabled={isAdding}>
            {isAdding ? "Menghubungkan..." : "Lanjutkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
