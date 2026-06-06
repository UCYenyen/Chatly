"use client"

import SpotlightCard from "@/components/personal/SpotlightCard"
import { CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRef, useState } from "react"
import { useGsapScrollReveal } from "@/hooks/use-gsap-scroll-reveal"
import { PLANS, PLANS_YEARLY } from "@/lib/utils/payment-gateway/plans"
import { describePlanFeatures } from "@/lib/utils/payment-gateway/plan-limits"
import { formatIDR } from "@/components/features/billing/billing-format"
import { authClient } from "@/lib/utils/auth/auth-client"
import type { SubscriptionPlan } from "@prisma/client"

export function PricingSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const { data: session } = authClient.useSession()
  const [isYearly, setIsYearly] = useState<boolean>(false)
  useGsapScrollReveal(sectionRef, {
    start: "top 84%",
    y: 10,
    fade: true,
  })

  const startDestination = session ? "/dashboard" : "/sign-up"

  const PLAN_IDS: SubscriptionPlan[] = ["STARTER", "GROWTH", "PRO", "ENTERPRISE"]

  const plans = PLAN_IDS.map((planId) => {
    const plan = PLANS[planId]
    const yearlyPlan = PLANS_YEARLY[planId]
    const isCustom = plan.amount === 0
    const activePlan = isYearly && yearlyPlan ? yearlyPlan : plan
    const features = describePlanFeatures(planId)
    const includedFeatures = features.filter((f) => f.included)
    const lockedFeatures = features.filter((f) => !f.included)

    return {
      id: planId,
      name: plan.name,
      price: isCustom ? "Kustom" : formatIDR(activePlan.amount),
      priceSuffix: isCustom ? null : isYearly ? "/thn" : "/bln",
      description: plan.description,
      features: [...includedFeatures, ...lockedFeatures],
      buttonText:
        planId === "STARTER" ? "Mulai Sekarang" :
        planId === "GROWTH" ? "Skala Sekarang" :
        planId === "PRO" ? "Jadi Pro" :
        "Hubungi kami",
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

      <div className="flex items-center gap-2 bg-surface-container-high/50 p-1 rounded-lg w-fit mb-12">
        <Button
          type="button"
          variant={isYearly ? "ghost" : "default"}
          size="sm"
          onClick={() => setIsYearly(false)}
          className={`${
            isYearly
              ? "text-outline"
              : "bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed/90"
          } font-bold text-[12px] px-4 py-1.5 h-auto rounded-md transition-all`}
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
          } font-bold text-[12px] px-4 py-1.5 h-auto rounded-md transition-all`}
        >
          Tahunan
          <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 bg-success/20 text-success rounded">
            Hemat 15%
          </span>
        </Button>
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
                {plan.priceSuffix && <span className="text-[12px] text-outline">{plan.priceSuffix}</span>}
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
              asChild
              className={`relative z-10 w-full font-bold text-[12px] h-11 transition-transform active:scale-95 border rounded-sm mt-auto shadow-sm ${
                plan.isPopular
                  ? 'bg-[#bff44c] text-[#141f00] hover:bg-[#a4d730] border-[#a4d730]'
                  : 'bg-[#bff44c] text-[#141f00] hover:bg-[#a4d730] border-outline-variant/20 tracking-wide'
              }`}
            >
              {plan.id === "ENTERPRISE" ? (
                <a href="mailto:chatlytype@gmail.com">
                  {plan.buttonText}
                </a>
              ) : (
                <Link href={startDestination}>
                  {plan.buttonText}
                </Link>
              )}
            </Button>
          </SpotlightCard>
        ))}
      </div>
    </section>
  )
}
