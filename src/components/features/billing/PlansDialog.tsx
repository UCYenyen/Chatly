"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { PLANS } from "@/lib/utils/payment-gateway/plans";
import { PlanCard } from "./PlanCard";
import { useBilling } from "./BillingProvider";
import type { SubscriptionPlan } from "@prisma/client";

const PLAN_ORDER: ReadonlyArray<SubscriptionPlan> = ["FREE", "PRO", "BUSINESS"];

export function PlansDialog() {
  const { data } = useBilling();
  const [open, setOpen] = useState<boolean>(false);
  const currentPlan: SubscriptionPlan =
    data?.subscription?.status === "ACTIVE" ? data.subscription.plan : "FREE";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-[#3545d6] text-white hover:bg-[#2c3ab5] font-bold text-[13px] h-11 px-6 rounded-md shadow-lg transition-transform active:scale-95"
      >
        Ubah Paket
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-5xl rounded-2xl bg-surface-container-low border border-outline-variant/15 p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup"
              className="absolute right-4 top-4 rounded-full p-2 text-outline hover:bg-surface-container hover:text-on-surface"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6 flex flex-col gap-1">
              <h2 className="text-2xl font-headline font-bold text-on-surface">
                Pilih Paket Berlangganan
              </h2>
              <p className="text-[13px] text-outline">
                Pembayaran diproses lewat Xendit (kartu, VA, e-wallet).
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {PLAN_ORDER.map((id) => (
                <PlanCard
                  key={id}
                  plan={PLANS[id]}
                  isCurrent={id === currentPlan}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
