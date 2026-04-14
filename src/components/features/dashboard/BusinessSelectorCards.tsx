import { Building2, Plus, ArrowRight, Settings2 } from "lucide-react"

export function BusinessSelectorCards() {
  const businesses = [
    {
      name: "Toko Utama Indonesia",
      plan: "Growth",
      status: "Aktif",
      messages: "1.2M",
      color: "bg-secondary-fixed text-on-secondary",
      borderColor: "border-secondary-fixed/50",
      glow: "shadow-[0_0_20px_rgba(164,215,48,0.15)]"
    },
    {
      name: "Aplikasi Dukungan B2B",
      plan: "Pro",
      status: "Aktif",
      messages: "980K",
      color: "bg-[#3545d6] text-white",
      borderColor: "border-[#3545d6]/50",
      glow: "shadow-[0_0_20px_rgba(53,69,214,0.15)]"
    },
    {
      name: "Proyek Ekspansi Q4",
      plan: "Starter",
      status: "Pengembangan",
      messages: "24K",
      color: "bg-surface-container-highest text-on-surface",
      borderColor: "border-outline-variant/30",
      glow: "shadow-lg"
    }
  ]

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-headline font-bold text-on-surface">Organisasi Bisnis Anda</h2>
        <button className="text-[12px] font-mono text-outline hover:text-on-surface transition-colors font-bold uppercase tracking-widest flex items-center gap-2">
          Kelola Ruang Kerja <Settings2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
        {businesses.map((biz) => (
          <div 
            key={biz.name}
            className={`bg-surface-container-low border border-outline-variant/15 p-6 rounded-xl flex flex-col justify-between cursor-pointer group hover:-translate-y-1 transition-all duration-300 ${biz.glow} hover:border-outline`}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-md flex items-center justify-center font-bold ${biz.color}`}>
                  {biz.name.charAt(0)}
                </div>
                <div className={`text-[9px] font-bold uppercase tracking-widest font-mono px-2 py-0.5 rounded border ${biz.borderColor} opacity-80 group-hover:opacity-100 transition-opacity`}>
                  {biz.plan}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-[16px] text-on-surface tracking-wide group-hover:text-secondary-fixed transition-colors line-clamp-1">{biz.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${biz.status === "Aktif" ? "bg-secondary-fixed" : "bg-outline"} shadow-[0_0_4px_currentColor]`}></div>
                  <span className="text-[11px] font-mono text-outline uppercase tracking-wider">{biz.status}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-outline-variant/10 flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                <ArrowRight className="w-4 h-4 text-on-surface" />
              </div>
            </div>
          </div>
        ))}

        {/* Add New Business Card */}
        <div className="border-2 border-dashed border-outline-variant/30 bg-surface-container/20 hover:bg-surface-container/50 hover:border-secondary-fixed/50 p-6 rounded-xl flex flex-col items-center justify-center cursor-pointer group transition-all duration-300 min-h-[220px]">
          <div className="w-14 h-14 rounded-full bg-surface-container border border-outline-variant/20 flex items-center justify-center mb-4 group-hover:bg-[#bff44c] group-hover:border-[#a4d730] transition-colors shadow-sm">
            <Plus className="w-6 h-6 text-outline group-hover:text-[#141f00] transition-colors" />
          </div>
          <span className="font-bold text-[15px] text-on-surface mb-1 text-center">Tambahkan Bisnis Baru</span>
          <span className="text-[12px] text-outline text-center max-w-[160px]">Buka instans baru untuk divisi atau merek lain.</span>
        </div>
      </div>
    </div>
  )
}
