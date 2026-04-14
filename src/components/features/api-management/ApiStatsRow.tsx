import { KeyRound, Timer, CheckCircle2, TrendingUp } from "lucide-react"

export function ApiStatsRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-8 w-full mt-4">
      <div className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-8 pb-9 relative overflow-hidden shadow-2xl min-h-[160px] flex flex-col justify-center">
        <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold mb-5">
          Total Permintaan (24 Jam)
        </span>
        <div className="flex items-end gap-2 mb-4 z-10">
          <span className="text-5xl font-headline font-bold text-on-surface leading-none tracking-tight">1.2jt</span>
        </div>
        <div className="flex items-center gap-1.5 text-secondary-fixed font-bold text-[11px] font-mono tracking-wide z-10">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+14.2% dari kemarin</span>
        </div>
        <KeyRound className="absolute -right-4 top-1/2 -translate-y-1/2 w-28 h-28 text-outline-variant/5 rotate-180 mix-blend-plus-lighter" strokeWidth={1.5} />
      </div>

      <div className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-8 pb-9 relative overflow-hidden shadow-2xl min-h-[160px] flex flex-col justify-center">
        <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold mb-5">
          Rata-rata Latensi
        </span>
        <div className="flex items-end gap-1 mb-4 z-10">
          <span className="text-5xl font-headline font-bold text-on-surface leading-none tracking-tight">42</span>
          <span className="text-xl text-outline font-medium mb-0.5 ml-1">ms</span>
        </div>
        <span className="text-[12px] text-outline z-10 mt-1 block">P95: 128ms</span>
        <Timer className="absolute -right-6 top-1/2 -translate-y-1/2 w-32 h-32 text-outline-variant/5 mix-blend-plus-lighter" strokeWidth={1.5} />
      </div>

      <div className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-8 pb-10 relative overflow-hidden shadow-2xl min-h-[160px] flex flex-col justify-start">
        <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold mb-5">
          Tingkat Keberhasilan
        </span>
        <div className="flex items-end gap-1 z-10 mb-6">
          <span className="text-5xl font-headline font-bold text-on-surface leading-none tracking-tight">99.9%</span>
        </div>
        <div className="absolute bottom-6 left-8 right-8 h-1 bg-secondary-fixed rounded-full shadow-[0_0_10px_rgba(164,215,48,0.5)] z-10"></div>
        <CheckCircle2 className="absolute -right-4 top-1/2 -translate-y-1/2 w-28 h-28 text-outline-variant/5 mix-blend-plus-lighter" strokeWidth={1.5} />
      </div>
    </div>
  )
}
