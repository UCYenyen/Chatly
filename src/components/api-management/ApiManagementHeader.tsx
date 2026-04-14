import { Bell, User } from "lucide-react"

export function ApiManagementHeader() {
  return (
    <div className="flex items-center justify-between w-full border-b border-outline-variant/10 pb-8 mt-2">
      <div className="flex items-center gap-4">
        <span className="text-[22px] font-headline font-bold text-on-surface tracking-wide">Manajemen API</span>
        <div className="bg-surface-container-high border border-secondary-fixed/20 text-secondary-fixed rounded-sm px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-widest font-mono shadow-sm">
          Produksi Langsung
        </div>
      </div>
      <div className="flex items-center gap-7">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-secondary-fixed shadow-[0_0_5px_rgba(164,215,48,0.8)]"></div>
          <span className="text-[13px] text-outline font-medium tracking-wide">Status API: Operasional</span>
        </div>
        <button className="text-outline hover:text-on-surface transition-colors cursor-pointer active:scale-95 ml-2">
          <Bell className="w-[18px] h-[18px] fill-current" />
        </button>
        <div className="w-8 h-8 rounded-md bg-surface-container-high border border-outline-variant/15 flex items-center justify-center cursor-pointer hover:bg-surface-container hover:border-outline-variant/30 transition-colors shadow-sm active:scale-95">
          <User className="w-[17px] h-[17px] text-outline" />
        </div>
      </div>
    </div>
  )
}
