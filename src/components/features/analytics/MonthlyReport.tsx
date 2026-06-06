"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, AlertTriangle, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useBusinessContext } from "@/components/features/business/BusinessProvider";
import { FeatureHelpButton } from "@/components/features/feature-unlock/FeatureHelpButton";
import { useUpdateBusiness } from "@/hooks/use-update-business";
import { useSendReport } from "@/hooks/use-send-report";
import type { ReportFormat } from "@/types/report.md";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function MonthlyReport() {
  const { activeBusiness, activeBusinessId, refresh } = useBusinessContext();
  const { updateBusiness, isPending } = useUpdateBusiness(activeBusinessId);
  const { sendNow, isPending: isSending } = useSendReport(
    activeBusinessId ?? "",
  );
  const emailRef = useRef<HTMLInputElement>(null);

  const focusEmail = (): void => {
    emailRef.current?.focus();
    emailRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const [enabled, setEnabled] = useState<boolean>(
    activeBusiness?.monthlyReportEnabled ?? false,
  );
  const [email, setEmail] = useState<string>(
    activeBusiness?.monthlyReportEmail ?? "",
  );
  const [format, setFormat] = useState<ReportFormat>(
    activeBusiness?.monthlyReportFormat ?? "XLSX",
  );

  const handleSave = async (): Promise<void> => {
    if (enabled && email.trim().length === 0) {
      toast.error("Email tujuan wajib diisi saat laporan diaktifkan");
      return;
    }
    const updated = await updateBusiness({
      monthlyReportEnabled: enabled,
      monthlyReportEmail: email.trim().length > 0 ? email.trim() : null,
      monthlyReportFormat: format,
    });
    if (updated) {
      toast.success("Pengaturan laporan bulanan disimpan");
      await refresh();
    } else {
      toast.error("Gagal menyimpan pengaturan laporan");
    }
  };

  const handleSendNow = async (): Promise<void> => {
    const trimmed = email.trim();
    if (trimmed.length === 0) {
      toast.error("Masukkan email tujuan dulu untuk menerima file laporan.");
      focusEmail();
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      toast.error("Format email tidak valid.");
      focusEmail();
      return;
    }

    if (trimmed !== (activeBusiness?.monthlyReportEmail ?? "")) {
      const saved = await updateBusiness({ monthlyReportEmail: trimmed });
      if (!saved) {
        toast.error("Gagal menyimpan email tujuan. Coba lagi.");
        return;
      }
      await refresh();
    }

    const result = await sendNow();
    if (result) {
      toast.success(
        `Laporan ${result.period} (${result.rowCount} transaksi) dikirim ke ${result.email}`,
      );
    } else {
      toast.error("Gagal mengirim laporan. Coba lagi sebentar.");
    }
  };

  return (
    <div
      data-tour="monthly-report"
      className="bg-surface-container-low border border-outline-variant/15 p-5 sm:p-8 rounded-xl flex flex-col shadow-xl h-fit min-w-0"
    >
      <div className="flex items-center gap-3 mb-6">
        <FileSpreadsheet className="w-5 h-5 shrink-0 text-secondary-fixed" />
        <h2 className="text-[17px] font-headline font-bold text-on-surface tracking-wide">
          Laporan Bulanan Otomatis
        </h2>
        <div className="ml-auto">
          <FeatureHelpButton feature="dataExport" />
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 p-4 rounded-md border border-outline-variant/15 bg-[#08111d] mb-6">
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-bold text-on-surface">
            Kirim laporan transaksi otomatis tiap bulan
          </span>
          <span className="text-[11px] text-outline mt-1 leading-relaxed">
            Laporan bulan sebelumnya dikirim ke email tujuan setiap awal bulan.
          </span>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} className="shrink-0" />
      </div>

      <div className="flex flex-col gap-2 mb-6 min-w-0">
        <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">
          Email Tujuan Laporan <span className="text-rose-400">*</span>
        </span>
        <Input
          ref={emailRef}
          type="email"
          inputMode="email"
          required
          aria-required
          placeholder="cth. laporan@perusahaan.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <span className="text-[11px] text-outline leading-relaxed">
          Wajib diisi — file laporan (CSV/Excel) dikirim ke email ini. Boleh
          berbeda dari email akun login Anda.
        </span>
      </div>

      <div className="flex flex-col gap-2 mb-6 min-w-0">
        <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">
          Format File
        </span>
        <Select value={format} onValueChange={(v) => setFormat(v as ReportFormat)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="XLSX">Excel (.xlsx)</SelectItem>
            <SelectItem value="CSV">CSV (.csv)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-md border border-amber-500/30 bg-amber-500/10 mb-6">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
        <span className="text-[11px] text-amber-200/90 leading-relaxed">
          Setelah laporan terkirim, data transaksi bulan tersebut akan dihapus
          permanen dari sistem. File pada email menjadi satu-satunya arsip.
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleSave} disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Menyimpan..." : "Simpan Pengaturan"}
        </Button>
        <Button
          onClick={handleSendNow}
          disabled={isSending}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <Send className="w-4 h-4" />
          {isSending ? "Mengirim..." : "Kirim sekarang"}
        </Button>
      </div>
    </div>
  );
}
