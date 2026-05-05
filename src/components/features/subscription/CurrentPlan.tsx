"use client";

import { useParams } from "next/navigation";
import { useSubscriptionContext } from "./SubscriptionProvider";
import { PlansDialog } from "./PlansDialog";
import { useCancelSubscription } from "@/hooks/use-cancel-subscription";
import { PLANS } from "@/lib/utils/payment-gateway/plans";
import { formatIDR, formatDateID } from "../billing/billing-format";
import type { SubscriptionPlan } from "@prisma/client";

export function CurrentPlan() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { data, isLoading, error, refresh } = useSubscriptionContext();
  const { isPending, cancel, error: cancelError } = useCancelSubscription(businessId);

  const sub = data?.subscription;
  const planId: SubscriptionPlan = sub?.status === "ACTIVE" ? sub.plan : "FREE";
  const plan = PLANS[planId];
  const isActive = sub?.status === "ACTIVE";

  const handleCancel = async (): Promise<void> => {
    if (!isActive || sub?.cancelAtPeriodEnd) return;
    const ok = await cancel();
    if (ok) await refresh();
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant/15 border-t-4 border-t-secondary-fixed p-8 xl:p-10 rounded-xl flex flex-col gap-8 shadow-2xl relative overflow-hidden h-full">
      <div className="flex items-start justify-between relative z-10 w-full">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono text-secondary-fixed uppercase tracking-widest font-bold">
            Paket Saat Ini
          </span>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-headline font-bold text-on-surface tracking-tight">
              Paket {plan.name}
            </h2>
            <div
              className={`rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest font-mono shadow-sm border ${
                isActive
                  ? "bg-[#143600]/80 border-[#304400] text-secondary-fixed"
                  : "bg-surface-container-high border-outline-variant/20 text-outline"
              }`}
            >
              {isLoading ? "MEMUAT" : (sub?.status ?? "FREE")}
            </div>
          </div>
        </div>
        <div className="flex items-end gap-1 flex-col md:flex-row md:items-baseline">
          <span className="text-4xl font-headline font-bold text-on-surface tracking-tight">
            {plan.amount === 0 ? "Gratis" : formatIDR(plan.amount)}
          </span>
          {plan.amount > 0 && <span className="text-outline text-[14px]">/bln</span>}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16 pt-6 border-t border-outline-variant/10 relative z-10">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold">
            Tanggal Penagihan Berikutnya
          </span>
          <span className="text-[14px] text-on-surface font-bold tracking-wide">
            {sub?.cancelAtPeriodEnd
              ? `Berakhir ${formatDateID(sub.currentPeriodEnd)}`
              : formatDateID(sub?.currentPeriodEnd ?? null)}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold">
            Metode Pembayaran
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {["BCA", "MANDIRI", "BRI", "OVO", "GOPAY", "DLL"].map((m) => (
              <div
                key={m}
                className="bg-surface-container-highest px-2 py-0.5 rounded text-[10px] font-mono text-on-surface font-bold border border-outline-variant/20"
              >
                {m}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-2 relative z-10">
        <PlansDialog />
        <button
          type="button"
          disabled={!isActive || isPending || sub?.cancelAtPeriodEnd}
          onClick={handleCancel}
          className="bg-surface-container border border-outline-variant/15 text-outline hover:text-on-surface hover:bg-surface-container-high font-bold text-[13px] h-11 px-6 rounded-md shadow-sm transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sub?.cancelAtPeriodEnd
            ? "Akan Dibatalkan"
            : isPending
              ? "Membatalkan..."
              : "Batalkan Langganan"}
        </button>
        {(error || cancelError) && (
          <span className="text-[12px] text-red-400">{error ?? cancelError}</span>
        )}
      </div>
    </div>
  );
}
