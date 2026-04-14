import { TrendingUp } from "lucide-react"

export function VerifiedConversion() {
  return (
    <div className="bg-surface-container-low border border-outline-variant/15 p-10 rounded-xl flex flex-col justify-center h-[280px] shadow-2xl">
      <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold mb-4">
        Konversi Niat Terverifikasi
      </span>
      <h2 className="text-7xl font-headline font-bold text-on-surface mb-6">
        98.2%
      </h2>
      <div className="flex items-center gap-2 text-secondary-fixed font-bold text-[13px]">
        <TrendingUp className="w-4 h-4" />
        <span>+12.4% dari periode lalu</span>
      </div>
    </div>
  )
}
