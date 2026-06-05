"use client"

import SpotlightCard from "@/components/personal/SpotlightCard"
import { CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRef } from "react"
import { useGsapScrollReveal } from "@/hooks/use-gsap-scroll-reveal"
import { PLANS } from "@/lib/utils/payment-gateway/plans"
import { describePlanFeatures } from "@/lib/utils/payment-gateway/plan-limits"
import { formatIDR } from "@/components/features/billing/billing-format"
import type { SubscriptionPlan } from "@prisma/client"

export function PricingSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  useGsapScrollReveal(sectionRef, {
    start: "top 84%",
    y: 10,
    fade: true,
  })

  const PLAN_IDS: SubscriptionPlan[] = ["STARTER", "GROWTH", "PRO", "ENTERPRISE"]

  const plans = PLAN_IDS.map((planId) => {
    const plan = PLANS[planId]
    const features = describePlanFeatures(planId)
    const includedFeatures = features.filter((f) => f.included).slice(0, 5)
    const notableLockedFeatures = features.filter((f) => !f.included).slice(0, 2)

    return {
      id: planId,
      name: plan.name,
      price: plan.amount === 0 ? "Kustom" : formatIDR(plan.amount),
      description: plan.description,
      features: [...includedFeatures, ...notableLockedFeatures],
      buttonText:
        planId === "STARTER" ? "Mulai Sekarang" :
        planId === "GROWTH" ? "Skala Sekarang" :
        planId === "PRO" ? "Jadi Pro" :
        "Hubungi Penjualan",
      isPopular: planId === "GROWTH"
    }
  })

  return (
    <section ref={sectionRef} id="pricing" className="container mx-auto px-10 xl:px-16 mt-32 lg:mt-40 flex flex-col items-center scroll-mt-32">
      <div className="text-center mb-16 flex flex-col items-center">
        <h2 className="text-3xl w-full text-start sm:text-center font-headline font-bold text-on-surface mb-4">Pilih Paket Anda</h2>
        <p className="text-[14px] w-full text-start sm:text-center text-outline max-w-lg leading-relaxed">
          Solusi skalabel untuk bisnis dari semua ukuran. Tanpa biaya tersembunyi, hanya performa murni.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
        {plans.map((plan) => (
          <SpotlightCard
            key={plan.id}
            className={`bg-surface-container-low border flex flex-col p-8 rounded-sm shadow-xl relative ${
              plan.isPopular ? 'border-outline-variant/30 scale-[1.02] bg-surface-container-low/90 z-10' : 'border-outline-variant/15'
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#bff44c] text-[#141f00] text-[9px] font-bold font-mono tracking-widest uppercase px-3 py-1 rounded shadow-md border border-[#a4d730]">
                Paling Populer
              </div>
            )}

            <div className="mb-8">
              <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold block mb-4">
                {plan.name}
              </span>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-headline font-bold text-on-surface leading-none">{plan.price}</span>
                {plan.price !== "Kustom" && <span className="text-[12px] text-outline">/bln</span>}
              </div>
              <span className="text-[11px] font-bold font-mono text-[#a4d730] block">
                {plan.description}
              </span>
            </div>

            <div className="flex flex-col gap-4 mb-10 flex-1">
              {plan.features.map((feat) => (
                <div key={feat.label} className="flex items-center gap-3">
                  {feat.included ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary-fixed fill-[#3545d6] shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-outline shrink-0" />
                  )}
                  <span className={`text-[13px] ${feat.included ? "text-on-surface" : "text-outline line-through"}`}>{feat.label}</span>
                </div>
              ))}
            </div>

            <Button
              className={`relative z-10 w-full font-bold text-[12px] h-11 transition-transform active:scale-95 border rounded-sm mt-auto shadow-sm ${
                plan.isPopular
                  ? 'bg-[#bff44c] text-[#141f00] hover:bg-[#a4d730] border-[#a4d730]'
                  : 'bg-[#bff44c] text-[#141f00] hover:bg-[#a4d730] border-outline-variant/20 tracking-wide'
              }`}
            >
              {plan.buttonText}
            </Button>
          </SpotlightCard>
        ))}
      </div>
    </section>
  )
}
