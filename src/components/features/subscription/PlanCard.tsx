"use client";

import { toast } from "sonner";
import { useSubscriptionContext } from "./SubscriptionProvider";
import { useWalletContext } from "../billing/WalletProvider";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useCheckout } from "@/hooks/use-checkout";
import { formatIDR } from "../billing/billing-format";
import { describePlanFeatures } from "@/lib/utils/payment-gateway/plan-limits";
import type { PlanDefinition } from "@/types/subscription.md";

interface PlanCardProps {
  plan: PlanDefinition;
  isCurrent: boolean;
}

export function PlanCard({ plan, isCurrent }: PlanCardProps) {
  const params = useParams();
  const businessId = params.businessId as string;
  const { isPending, error, startCheckout } = useCheckout(businessId);
  const { refresh: refreshSub } = useSubscriptionContext();
  const { refresh: refreshWallet } = useWalletContext();
  const isFree = plan.id === "FREE";
  const isEnterprise = plan.id === "ENTERPRISE";
  const WHATSAPP_NUMBER = "6281231847161";

  const handleClick = async (): Promise<void> => {
    if (isFree || isCurrent || isEnterprise) return;
    const result = await startCheckout(plan.id as Exclude<PlanDefinition["id"], "FREE">);
    if (result.ok) {
      toast.success(`Berhasil berlangganan paket ${plan.name}`);
      void refreshSub();
      void refreshWallet();
    } else {
      toast.error(result.message);
    }
  };

  const handleContactWhatsApp = (): void => {
    const message = `Halo, saya tertarik dengan paket ${plan.name}. Bisakah Anda memberikan lebih banyak informasi tentang harga dan ketersediaan?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank");
  };

  return (
    <div
      className={`flex flex-col gap-3 sm:gap-4 md:gap-5 rounded-xl border p-4 sm:p-5 md:p-6 shadow-lg transition-colors min-w-0 ${
        plan.highlighted
          ? "border-secondary-fixed/40 bg-surface-container"
          : "border-outline-variant/15 bg-surface-container-low"
      }`}
    >
      <div className="flex flex-col gap-0.5 sm:gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest font-bold text-secondary-fixed truncate">
            {plan.name}
          </span>
          {isCurrent && (
            <span className="rounded border border-success bg-success/20 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-mono font-bold uppercase tracking-widest text-success whitespace-nowrap">
              Aktif
            </span>
          )}
        </div>
        <p className="text-[11px] sm:text-[12px] md:text-[13px] text-outline line-clamp-3">{plan.description}</p>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl sm:text-2xl md:text-3xl font-headline font-bold text-on-surface tracking-tight">
          {isFree ? "Gratis" : isEnterprise ? "Custom" : formatIDR(plan.amount)}
        </span>
        {!isFree && !isEnterprise && <span className="text-outline text-[11px] sm:text-[12px] md:text-[13px]">{plan.interval === "year" ? "/thn" : "/bln"}</span>}
      </div>

      <ul className="flex flex-col gap-1.5 sm:gap-2">
        {describePlanFeatures(plan.id).map((f) => (
          <li key={f.label} className="flex items-start gap-2 text-[10px] sm:text-[11px] md:text-[13px] min-w-0">
            {f.included ? (
              <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-secondary-fixed shrink-0 mt-0.5" />
            ) : (
              <X className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-outline shrink-0 mt-0.5" />
            )}
            <span className={`${f.included ? "text-on-surface" : "text-outline line-through"} leading-snug`}>
              {f.label}
            </span>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        disabled={isFree || isCurrent || (isPending && !isEnterprise)}
        onClick={isEnterprise ? handleContactWhatsApp : handleClick}
        className="mt-auto h-9 sm:h-10 md:h-11 rounded-md bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed/90 px-3 sm:px-4 text-[11px] sm:text-[12px] md:text-[13px] font-bold shadow-lg transition-transform disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isCurrent ? "Paket Saat Ini" : isFree ? "Tidak Tersedia" : isEnterprise ? "Hubungi WhatsApp" : isPending ? "Menyiapkan..." : "Pilih Paket"}
      </Button>

      {error && <p className="text-[10px] sm:text-[11px] text-error">{error}</p>}
    </div>
  );
}
