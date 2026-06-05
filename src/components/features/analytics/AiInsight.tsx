"use client"

import { Sparkles, Zap } from "lucide-react"
import { usePlanGate } from "@/hooks"
import { FeatureLock } from "@/components/features/subscription/FeatureLock"

export function AiInsight() {
  const gate = usePlanGate()
  const locked = !gate.isLoading && !gate.hasFeature("aiInsight")

  return (
    <FeatureLock
      locked={locked}
      requiredPlan={gate.requiredPlanForFeature("aiInsight")}
      featureName="Wawasan AI"
    >
    <div className="bg-surface-container-low border border-outline-variant/15 border-l-4 border-l-secondary-fixed p-6 rounded-xl relative shadow-2xl overflow-hidden h-full flex items-start min-h-[160px]">
      <div className="flex gap-4">
        <Sparkles className="w-5 h-5 text-secondary-fixed flex-shrink-0 mt-1 fill-secondary-fixed" />
        <div className="flex flex-col gap-2">
          <h2 className="text-[15px] font-headline font-bold text-on-surface">Wawasan AI</h2>
          <p className="text-[13px] text-outline leading-relaxed max-w-[240px]">
            Korelasi tinggi ditemukan antara pertanyaan &quot;Produk X&quot; dan tr...
          </p>
        </div>
      </div>
      
      <div className="absolute right-0 bottom-0 bg-surface-container border-t border-l border-outline-variant/20 rounded-tl-xl p-3.5 px-5 flex items-center gap-4 shadow-[-5px_-5px_20px_rgba(0,0,0,0.2)]">
        <div className="bg-primary p-2 rounded-md shadow-lg">
          <Zap className="w-4 h-4 text-white fill-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold">Model Aktif</span>
          <span className="text-[13px] font-bold text-secondary-fixed mt-0.5">Kinetic-Engine v2.4</span>
        </div>
      </div>
    </div>
    </FeatureLock>
  )
}
