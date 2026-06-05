"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { PLANS, PLANS_YEARLY } from "@/lib/utils/payment-gateway/plans";
import { PlanCard } from "./PlanCard";
import { useSubscriptionContext } from "./SubscriptionProvider";
import type { SubscriptionPlan } from "@prisma/client";

const PLAN_ORDER: ReadonlyArray<SubscriptionPlan> = ["STARTER", "GROWTH", "PRO", "ENTERPRISE"];

export function PlansDialog() {
  const { data } = useSubscriptionContext();
  const [open, setOpen] = useState<boolean>(false);
  const [isYearly, setIsYearly] = useState<boolean>(false);
  const currentPlan: SubscriptionPlan =
    data?.subscription?.status === "ACTIVE" ? data.subscription.plan : "FREE";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed/90 font-bold text-[13px] h-11 px-6 rounded-md shadow-lg transition-transform"
        >
          Ubah Paket
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-2xl md:max-w-4xl bg-surface-container-low/95 backdrop-blur-xl border-outline-variant/20 shadow-2xl p-0 overflow-y-auto max-h-[90vh]">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-transparent pointer-events-none" />

        <DialogHeader className="px-4 py-4 sm:px-6 sm:py-6 pb-3 sm:pb-4 z-20 sticky top-0 bg-surface-container-low/80 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-lg sm:text-xl md:text-2xl font-headline font-bold text-on-surface">
                Pilih Paket Berlangganan
              </DialogTitle>
              <DialogDescription className="text-outline text-xs sm:text-sm leading-relaxed mt-1 sm:mt-2">
                Pembayaran diproses lewat Xendit (kartu, VA, e-wallet).
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 text-outline hover:text-on-surface hover:bg-surface-container"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Tutup</span>
              </Button>
            </DialogClose>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-high/50 p-1 rounded-lg w-fit">
            <Button
              type="button"
              variant={isYearly ? "ghost" : "default"}
              size="sm"
              onClick={() => setIsYearly(false)}
              className={`${
                isYearly
                  ? "text-outline"
                  : "bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed/90"
              } font-bold text-[12px] px-3 py-1.5 h-auto rounded-md transition-all`}
            >
              Bulanan
            </Button>
            <Button
              type="button"
              variant={!isYearly ? "ghost" : "default"}
              size="sm"
              onClick={() => setIsYearly(true)}
              className={`${
                !isYearly
                  ? "text-outline"
                  : "bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed/90"
              } font-bold text-[12px] px-3 py-1.5 h-auto rounded-md transition-all`}
            >
              Tahunan
              <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 bg-success/20 text-success rounded">
                Hemat 15%
              </span>
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 px-4 py-4 sm:px-6 sm:py-6 pt-2 relative z-10">
          {PLAN_ORDER.map((id) => {
            const plan = isYearly ? PLANS_YEARLY[id] : PLANS[id];
            if (!plan) return null;
            return (
              <PlanCard
                key={`${id}-${isYearly ? 'yearly' : 'monthly'}`}
                plan={plan}
                isCurrent={id === currentPlan}
              />
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
