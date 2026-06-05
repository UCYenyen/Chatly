"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { useBusinessContext } from "@/components/features/business/BusinessProvider";
import { useUpdateBusiness } from "@/hooks/use-update-business";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DAY_KEYS,
  DAY_LABELS,
  DEFAULT_TIMEZONE,
  SUPPORTED_TIMEZONES,
  createDefaultWeeklyHours,
  type DayKey,
  type WeeklyHours,
} from "@/types/business-hours.md";

export function BusinessHours() {
  const { activeBusiness, refresh } = useBusinessContext();
  const { updateBusiness, isPending } = useUpdateBusiness(activeBusiness?.id ?? null);

  const [enabled, setEnabled] = useState<boolean>(
    activeBusiness?.handoverHoursEnabled ?? false,
  );
  const [timezone, setTimezone] = useState<string>(
    activeBusiness?.timezone ?? DEFAULT_TIMEZONE,
  );
  const [hours, setHours] = useState<WeeklyHours>(
    activeBusiness?.businessHours ?? createDefaultWeeklyHours(),
  );
  const [notificationPhone, setNotificationPhone] = useState<string>(
    activeBusiness?.notificationPhone ?? "",
  );

  const setDayClosed = (day: DayKey, closed: boolean) => {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], closed } }));
  };

  const setDayTime = (day: DayKey, field: "open" | "close", value: string) => {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const handleSave = async () => {
    const updated = await updateBusiness({
      handoverHoursEnabled: enabled,
      timezone,
      businessHours: hours,
      notificationPhone: notificationPhone.trim() || null,
    });
    if (updated) {
      toast.success("Jam operasional handover disimpan");
      await refresh();
    } else {
      toast.error("Gagal menyimpan jam operasional");
    }
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant/15 p-8 rounded-xl flex flex-col shadow-xl h-fit">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-5 h-5 text-secondary-fixed" fill="currentColor" fillOpacity={0.2} />
        <h2 className="text-[17px] font-headline font-bold text-on-surface tracking-wide">
          Jam Operasional Handover
        </h2>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">
          Nomor WhatsApp Notifikasi Handover
        </span>
        <Input
          type="tel"
          inputMode="tel"
          placeholder="cth. 628123456789"
          value={notificationPhone}
          onChange={(e) => setNotificationPhone(e.target.value)}
        />
        <span className="text-[11px] text-outline leading-relaxed">
          Nomor pribadi admin (berbeda dari nomor bot) yang menerima notifikasi saat percakapan dialihkan. Kosongkan untuk menonaktifkan.
        </span>
      </div>

      <div className="flex items-start justify-between gap-4 p-4 rounded-md border border-outline-variant/15 bg-[#08111d] mb-6">
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-on-surface">
            Batasi handover ke admin sesuai jam buka
          </span>
          <span className="text-[11px] text-outline mt-1 leading-relaxed">
            Di luar jam ini, pelanggan tidak akan dialihkan ke admin dan tetap dilayani AI.
          </span>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <div className={enabled ? "flex flex-col gap-5" : "flex flex-col gap-5 opacity-50 pointer-events-none"}>
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">
            Zona Waktu
          </span>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih zona waktu" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">
            Jam Buka Mingguan
          </span>
          <div className="flex flex-col gap-2">
            {DAY_KEYS.map((day) => {
              const config = hours[day];
              return (
                <div
                  key={day}
                  className="flex items-center gap-3 p-3 rounded-md border border-outline-variant/15 bg-[#08111d]"
                >
                  <span className="w-16 text-[13px] font-bold text-on-surface shrink-0">
                    {DAY_LABELS[day]}
                  </span>
                  <Switch
                    checked={!config.closed}
                    onCheckedChange={(open) => setDayClosed(day, !open)}
                  />
                  {config.closed ? (
                    <span className="text-[12px] text-outline">Tutup</span>
                  ) : (
                    <div className="flex items-center gap-2 ml-auto">
                      <Input
                        type="time"
                        value={config.open}
                        onChange={(e) => setDayTime(day, "open", e.target.value)}
                        className="w-28"
                      />
                      <span className="text-outline text-[12px]">—</span>
                      <Input
                        type="time"
                        value={config.close}
                        onChange={(e) => setDayTime(day, "close", e.target.value)}
                        className="w-28"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={isPending} className="mt-6 self-end">
        {isPending ? "Menyimpan..." : "Simpan Jam Operasional"}
      </Button>
    </div>
  );
}
