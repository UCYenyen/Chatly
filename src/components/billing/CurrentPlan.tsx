export function CurrentPlan() {
  return (
    <div className="bg-surface-container-low border border-outline-variant/15 border-t-4 border-t-secondary-fixed p-8 xl:p-10 rounded-xl flex flex-col gap-8 shadow-2xl relative overflow-hidden h-full">
      <div className="flex items-start justify-between relative z-10 w-full">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono text-secondary-fixed uppercase tracking-widest font-bold">Paket Saat Ini</span>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-headline font-bold text-on-surface tracking-tight">Paket Growth</h2>
            <div className="bg-[#143600]/80 border border-[#304400] text-secondary-fixed rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest font-mono shadow-sm">
              AKTIF
            </div>
          </div>
        </div>
        <div className="flex items-end gap-1 flex-col md:flex-row md:items-baseline">
          <span className="text-4xl font-headline font-bold text-on-surface tracking-tight">Rp 349.000</span>
          <span className="text-outline text-[14px]">/bln</span>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16 pt-6 border-t border-outline-variant/10 relative z-10">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold">Tanggal Penagihan Berikutnya</span>
          <span className="text-[14px] text-on-surface font-bold tracking-wide">12 Desember 2024</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold">Metode Pembayaran</span>
          <div className="flex items-center gap-2">
            <div className="bg-surface-container-highest px-2 py-0.5 rounded text-[10px] font-mono text-on-surface font-bold border border-outline-variant/20">BCA</div>
            <div className="bg-surface-container-highest px-2 py-0.5 rounded text-[10px] font-mono text-on-surface font-bold border border-outline-variant/20">MANDIRI</div>
            <div className="bg-surface-container-highest px-2 py-0.5 rounded text-[10px] font-mono text-on-surface font-bold border border-outline-variant/20">BRI</div>
            <div className="bg-surface-container-highest px-2 py-0.5 rounded text-[10px] font-mono text-on-surface font-bold border border-outline-variant/20">OVO</div>
            <div className="bg-surface-container-highest px-2 py-0.5 rounded text-[10px] font-mono text-on-surface font-bold border border-outline-variant/20">GOPAY</div>
            <div className="bg-surface-container-highest px-2 py-0.5 rounded text-[10px] font-mono text-on-surface font-bold border border-outline-variant/20">DLL</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-2 relative z-10">
        <button className="bg-[#3545d6] text-white hover:bg-[#2c3ab5] font-bold text-[13px] h-11 px-6 rounded-md shadow-lg transition-transform active:scale-95">
          Ubah Paket
        </button>
        <button className="bg-surface-container border border-outline-variant/15 text-outline hover:text-on-surface hover:bg-surface-container-high font-bold text-[13px] h-11 px-6 rounded-md shadow-sm transition-transform active:scale-95">
          Batalkan Langganan
        </button>
      </div>

      {/* Decorative Star/Sparkle Elements matching reference */}
      <div className="absolute right-8 top-16 opacity-5 pointer-events-none text-on-surface">
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-32 h-32 transform rotate-12">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
        </svg>
      </div>
      <div className="absolute right-32 top-32 opacity-5 pointer-events-none text-on-surface">
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-16 h-16 transform -rotate-12">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
        </svg>
      </div>
    </div>
  )
}
