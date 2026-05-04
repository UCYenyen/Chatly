"use client";

import { Check, X } from "lucide-react";
import { useCheckout } from "@/hooks/use-checkout";
import { formatIDR } from "./billing-format";
import type { PlanDefinition } from "@/types/subscription.md";

interface PlanCardProps {
  plan: PlanDefinition;
  isCurrent: boolean;
}

export function PlanCard({ plan, isCurrent }: PlanCardProps) {
  const { isPending, error, startCheckout } = useCheckout();
  const isFree = plan.id === "FREE";

  const handleClick = async (): Promise<void> => {
    if (isFree || isCurrent) return;
    await startCheckout(plan.id as Exclude<PlanDefinition["id"], "FREE">);
  };

  return (
    <div
      className={`flex flex-col gap-5 rounded-xl border p-6 shadow-lg transition-colors ${
        plan.highlighted
          ? "border-secondary-fixed/40 bg-surface-container"
          : "border-outline-variant/15 bg-surface-container-low"
      }`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-secondary-fixed">
            {plan.name}
          </span>
          {isCurrent && (
            <span className="rounded border border-[#304400] bg-[#143600]/80 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest text-secondary-fixed">
              Aktif
            </span>
          )}
        </div>
        <p className="text-[13px] text-outline">{plan.description}</p>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-headline font-bold text-on-surface tracking-tight">
          {isFree ? "Gratis" : formatIDR(plan.amount)}
        </span>
        {!isFree && <span className="text-outline text-[13px]">/bln</span>}
      </div>

      <ul className="flex flex-col gap-2">
        {plan.features.map((f) => (
          <li key={f.label} className="flex items-center gap-2 text-[13px]">
            {f.included ? (
              <Check className="h-4 w-4 text-secondary-fixed shrink-0" />
            ) : (
              <X className="h-4 w-4 text-outline shrink-0" />
            )}
            <span className={f.included ? "text-on-surface" : "text-outline line-through"}>
              {f.label}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={isFree || isCurrent || isPending}
        onClick={handleClick}
        className="mt-auto h-11 rounded-md bg-[#3545d6] px-4 text-[13px] font-bold text-white shadow-lg transition-transform active:scale-95 hover:bg-[#2c3ab5] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isCurrent ? "Paket Saat Ini" : isFree ? "Tidak Tersedia" : isPending ? "Menyiapkan..." : "Pilih Paket"}
      </button>

      {error && <p className="text-[12px] text-red-400">{error}</p>}
    </div>
  );
}
