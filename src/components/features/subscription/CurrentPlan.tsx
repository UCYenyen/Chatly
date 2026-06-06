"use client";

import { useParams } from "next/navigation";
import { useSubscriptionContext } from "./SubscriptionProvider";
import { PlansDialog } from "./PlansDialog";
import { CurrentPlanSkeleton } from "./CurrentPlanSkeleton";
import { useCancelSubscription } from "@/hooks/use-cancel-subscription";
import { FeatureHelpButton } from "@/components/features/feature-unlock/FeatureHelpButton";
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

  if (isLoading) {
    return <CurrentPlanSkeleton />;
  }

  return (
    <div data-tour="current-plan" className="bg-surface-container-low border border-outline-variant/15 border-t-4 border-t-secondary-fixed p-5 sm:p-8 xl:p-10 w-full rounded-xl flex flex-col gap-6 sm:gap-8 shadow-2xl relative overflow-hidden h-full">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 relative z-10 w-full">
        <div className="flex flex-col gap-2 w-full md:w-auto min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-secondary-fixed uppercase tracking-widest font-bold">
              Paket Saat Ini
            </span>
            <FeatureHelpButton topic="currentPlan" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface tracking-tight wrap-break-word">
            {isActive ? `Paket ${plan.name}` : "Tidak ada paket aktif"}
          </h2>
        </div>
        <div className="flex flex-col gap-3 w-full md:w-auto items-start md:items-end shrink-0">
          <div
            className={`rounded px-2.5 w-fit py-0.5 text-[10px] font-bold uppercase tracking-widest font-mono shadow-sm border ${isActive
              ? "bg-[#143600]/80 border-[#304400] text-secondary-fixed"
              : "bg-surface-container-high border-outline-variant/20 text-outline"
              }`}
          >
            {isActive ? sub?.status : "TIDAK AKTIF"}
          </div>
          {isActive && (
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-headline font-bold text-on-surface tracking-tight">
                {plan.amount === 0 ? "Gratis" : formatIDR(plan.amount)}
              </span>
              {plan.amount > 0 && <span className="text-outline text-[14px]">/bln</span>}
            </div>
          )}
        </div>
      </div>

      {isActive && (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-16 pt-6 border-t border-outline-variant/10 relative z-10">
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
      )}

      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 mt-2 relative z-10 *:w-full *:sm:w-auto">
        <PlansDialog />
        <button
          type="button"
          disabled={!isActive || isPending || sub?.cancelAtPeriodEnd}
          onClick={handleCancel}
          className="bg-surface-container border border-outline-variant/15 text-outline hover:text-on-surface hover:bg-surface-container-high font-bold text-[13px] h-11 px-6 rounded-md shadow-sm transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 w-full sm:w-auto"
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
