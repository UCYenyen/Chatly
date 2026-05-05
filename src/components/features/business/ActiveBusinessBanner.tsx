"use client";

import { Rocket } from "lucide-react";
import Link from "next/link";
import { useBusinessContext } from "./BusinessProvider";

interface ActiveBusinessBannerProps {
  scopeLabel: string;
}

export function ActiveBusinessBanner({ scopeLabel }: ActiveBusinessBannerProps) {
  const { activeBusiness, businesses, isLoading } = useBusinessContext();

  if (isLoading && !activeBusiness) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-outline-variant/15 bg-surface-container-low px-5 py-3 text-[12px] text-outline">
        Memuat bisnis aktif...
      </div>
    );
  }

  if (!activeBusiness) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-outline-variant/30 bg-surface-container/30 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-surface-container-high flex items-center justify-center">
            <Rocket className="w-4 h-4 text-outline" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-on-surface">
              {businesses.length === 0
                ? "Anda belum memiliki bisnis"
                : "Belum ada bisnis aktif"}
            </span>
            <span className="text-[11px] text-outline">
              {scopeLabel} dipersonalisasi per bisnis. Pilih atau buat satu untuk memulai.
            </span>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="text-[11px] font-mono uppercase tracking-widest font-bold text-secondary-fixed hover:text-secondary transition-colors"
        >
          Ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-secondary-fixed/30 bg-surface-container-low px-5 py-3 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-md bg-secondary-fixed text-on-secondary flex items-center justify-center">
          <Rocket className="w-4 h-4" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-secondary-fixed">
            {scopeLabel} untuk
          </span>
          <span className="text-[14px] font-bold text-on-surface truncate">
            {activeBusiness.name}
          </span>
        </div>
      </div>
    </div>
  );
}
