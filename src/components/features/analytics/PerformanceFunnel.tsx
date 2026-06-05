"use client"

import { useParams } from "next/navigation"
import { TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { usePerformanceFunnel } from "@/hooks"
import type { PerformanceFunnelStage } from "@/types/analytics.md"
import { PerformanceFunnelSkeleton } from "./PerformanceFunnelSkeleton"

const STAGE_DESCRIPTIONS: Record<string, string> = {
  mengobrol: "Pelanggan yang mengirim pesan ke bot",
  tertarik:
    "Bot mendeteksi minat beli dari percakapan (tanya harga, stok, bandingkan produk)",
  membeli: "Pelanggan yang menyelesaikan pembayaran",
  pendapatan: "Total nilai transaksi yang berhasil",
}

const MIN_BAR_WIDTH_PERCENT = 8

function barWidth(value: number, maxValue: number): number {
  if (maxValue <= 0) {
    return MIN_BAR_WIDTH_PERCENT
  }
  return Math.max(MIN_BAR_WIDTH_PERCENT, (value / maxValue) * 100)
}

function DropOffLabel({ percent }: { percent: number | null }) {
  if (percent === null) {
    return (
      <span className="text-[11px] font-mono text-outline">—</span>
    )
  }
  if (percent < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-secondary-fixed">
        <TrendingUp className="w-3 h-3" />
        naik +{Math.abs(percent)}%
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-outline">
      <TrendingDown className="w-3 h-3" />
      {percent}%
    </span>
  )
}

function CountStageRow({
  stage,
  maxValue,
  showDropOff,
}: {
  stage: PerformanceFunnelStage
  maxValue: number
  showDropOff: boolean
}) {
  return (
    <div className="space-y-1.5">
      {showDropOff && (
        <div className="flex justify-end">
          <DropOffLabel percent={stage.dropOffPercent} />
        </div>
      )}
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[13px] font-headline font-bold text-on-surface">
          {stage.label}
        </span>
        <span className="text-[22px] font-bold font-mono text-on-surface tabular-nums">
          {stage.display}
        </span>
      </div>
      <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
        <div
          className="h-full bg-secondary-fixed rounded-full transition-all"
          style={{ width: `${barWidth(stage.value, maxValue)}%` }}
        />
      </div>
      <p className="text-[12px] text-outline leading-relaxed">
        {STAGE_DESCRIPTIONS[stage.key]}
      </p>
    </div>
  )
}

function RevenueRow({ stage }: { stage: PerformanceFunnelStage }) {
  return (
    <div className="bg-secondary-fixed/10 border border-secondary-fixed/30 rounded-xl p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-secondary-fixed/20 p-2.5 rounded-lg">
          <Wallet className="w-5 h-5 text-secondary-fixed" />
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-headline font-bold text-on-surface">
            {stage.label}
          </span>
          <span className="text-[12px] text-outline">
            {STAGE_DESCRIPTIONS[stage.key]}
          </span>
        </div>
      </div>
      <span className="text-[26px] font-bold font-headline text-secondary-fixed tabular-nums">
        {stage.display}
      </span>
    </div>
  )
}

function FunnelHeader({ verdict }: { verdict: string }) {
  return (
    <div className="mb-8">
      <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">
        Performa Bot
      </span>
      <p className="text-[18px] font-headline font-bold text-on-surface mt-2 leading-snug max-w-[480px]">
        {verdict}
      </p>
    </div>
  )
}

export function PerformanceFunnel() {
  const params = useParams()
  const businessId = (params?.businessId || params?.id) as string

  const { stages, verdict, isLoading, error } = usePerformanceFunnel(businessId)

  if (isLoading) {
    return <PerformanceFunnelSkeleton />
  }

  if (error || stages.length === 0) {
    return (
      <div className="bg-surface-container-low border border-outline-variant/15 p-8 rounded-xl flex flex-col justify-center shadow-2xl min-h-[220px]">
        <p className="text-[13px] text-outline">{error || "Gagal memuat data"}</p>
      </div>
    )
  }

  const countStages = stages.filter((stage) => stage.format === "count")
  const revenueStage = stages.find((stage) => stage.format === "currency")
  const chatStage = countStages[0]

  if (!chatStage || chatStage.value === 0) {
    return (
      <div className="bg-surface-container-low border border-outline-variant/15 border-t-4 border-t-secondary-fixed p-8 rounded-xl shadow-2xl min-h-[220px] flex flex-col justify-center">
        <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">
          Performa Bot
        </span>
        <p className="text-[15px] text-outline mt-3">
          Belum ada percakapan untuk dianalisis
        </p>
      </div>
    )
  }

  const maxCountValue = Math.max(...countStages.map((stage) => stage.value))

  return (
    <div className="bg-surface-container-low border border-outline-variant/15 border-t-4 border-t-secondary-fixed p-8 rounded-xl shadow-2xl">
      <FunnelHeader verdict={verdict} />
      {revenueStage && <RevenueRow stage={revenueStage} />}
      <br />
      <div className="space-y-5">
        {countStages.map((stage, index) => (
          <CountStageRow
            key={stage.key}
            stage={stage}
            maxValue={maxCountValue}
            showDropOff={index > 0}
          />
        ))}
      </div>
    </div>
  )
}
