import { Zap } from "lucide-react"
import CountUp from "@/components/personal/CountUp"
import SpotlightCard from "@/components/personal/SpotlightCard"

export function FeaturesRow() {
  return (
    <section className="container mx-auto px-10 xl:px-16 mt-28 lg:mt-36">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* Box 1 */}
        <SpotlightCard className="bg-surface-container-low border border-outline-variant/15 p-10 rounded-sm flex flex-col justify-center min-h-[180px] shadow-xl">
          <Zap className="w-6 h-6 text-secondary-fixed mb-6 fill-secondary-fixed mix-blend-plus-lighter shadow-[0_0_15px_rgba(164,215,48,0.5)]" />
          <h3 className="text-[17px] font-headline font-bold text-on-surface mb-2 tracking-wide">Respons Instan</h3>
          <p className="text-[12px] text-outline leading-relaxed max-w-[250px]">
             Latensi di bawah 2 detik untuk semua interaksi pelanggan, di seluruh dunia.
          </p>
        </SpotlightCard>

        {/* Box 2 */}
        <SpotlightCard className="bg-surface-container-low border border-outline-variant/15 p-10 rounded-sm flex flex-col justify-center min-h-[180px] shadow-xl items-start">
          <h2 className="text-4xl font-headline font-bold text-on-surface mb-2"><CountUp to={50} />+</h2>
          <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold leading-relaxed">
            Bahasa<br />Didukung
          </span>
        </SpotlightCard>

        {/* Box 3 */}
        <SpotlightCard spotlightColor="rgba(200, 204, 255, 0.2)" className="bg-[#3545d6] p-10 rounded-sm flex flex-col justify-center min-h-[180px] shadow-[0_0_25px_rgba(53,69,214,0.3)] items-start text-white">
          <h2 className="text-5xl font-headline font-bold text-white mb-2">24/7</h2>
          <span className="text-[11px] font-mono text-[#c8ccff] uppercase tracking-widest font-bold leading-relaxed">
            Waktu Aktif Otonom
          </span>
        </SpotlightCard>
      </div>
    </section>
  )
}
