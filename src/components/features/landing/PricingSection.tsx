import SpotlightCard from "@/components/personal/SpotlightCard"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PricingSection() {
  const plans = [
    {
      name: "STARTER",
      price: "Rp 149rb",
      description: "Individu & Proyek Kecil",
      features: ["300 sesi", "3.000 pesan", "Analitik Dasar"],
      buttonText: "Mulai Sekarang",
      isPopular: false
    },
    {
      name: "GROWTH",
      price: "Rp 349rb",
      description: "Tim yang Berkembang",
      features: ["1.000 sesi", "10.000 pesan", "Basis Pengetahuan Kustom"],
      buttonText: "Skala Sekarang",
      isPopular: true
    },
    {
      name: "PRO",
      price: "Rp 749rb",
      description: "Perusahaan Volume Tinggi",
      features: ["3.000 sesi", "30.000 pesan", "Akses API"],
      buttonText: "Jadi Pro",
      isPopular: false
    },
    {
      name: "ENTERPRISE",
      price: "Kustom",
      description: "Skala Global",
      features: ["Sesi Tanpa Batas", "Pelatihan LLM Kustom", "Dukungan Khusus"],
      buttonText: "Hubungi Penjualan",
      isPopular: false
    }
  ]

  return (
    <section id="pricing" className="container mx-auto px-10 xl:px-16 mt-32 lg:mt-40 flex flex-col items-center scroll-mt-32">
      <div className="text-center mb-16 flex flex-col items-center">
        <h2 className="text-3xl font-headline font-bold text-on-surface mb-4">Pilih Paket Anda</h2>
        <p className="text-[14px] text-outline max-w-lg leading-relaxed">
          Solusi skalabel untuk bisnis dari semua ukuran. Tanpa biaya tersembunyi, hanya performa murni.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
        {plans.map((plan) => (
          <SpotlightCard 
            key={plan.name} 
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
              {plan.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-fixed fill-[#3545d6]" />
                  <span className="text-[13px] text-outline">{feat}</span>
                </div>
              ))}
            </div>

            <Button 
              className={`w-full font-bold text-[12px] h-11 transition-transform active:scale-95 border rounded-sm mt-auto shadow-sm ${
                plan.isPopular 
                  ? 'bg-[#bff44c] text-[#141f00] hover:bg-[#a4d730] border-[#a4d730]' 
                  : 'bg-transparent text-outline hover:text-on-surface hover:bg-surface-container border-outline-variant/20 tracking-wide'
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
