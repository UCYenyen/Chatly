export function BillingInfo() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8 w-full">
      {/* Billing Address */}
      <div className="bg-surface-container-low border border-outline-variant/15 rounded-xl p-8 shadow-2xl shrink-0">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[15px] font-headline font-bold text-on-surface">Alamat Penagihan</span>
          <button className="text-[10px] font-mono text-secondary-fixed uppercase tracking-widest font-bold hover:text-secondary transition-colors">
            Perbarui
          </button>
        </div>
        <div className="flex flex-col gap-1.5 text-[13.5px] text-outline leading-relaxed">
          <span className="font-bold text-on-surface mb-0.5">Alex Thompson</span>
          <span>Jl. Jendral Sudirman No. 45</span>
          <span>Jakarta Selatan, 12190</span>
          <span>Indonesia</span>
        </div>
      </div>

      {/* Tax Information */}
      <div className="bg-surface-container-low border border-outline-variant/15 rounded-xl p-8 shadow-2xl shrink-0">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[15px] font-headline font-bold text-on-surface">Informasi Pajak</span>
          <button className="text-[10px] font-mono text-secondary-fixed uppercase tracking-widest font-bold hover:text-secondary transition-colors">
            Edit
          </button>
        </div>
        
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold">VAT/TAX ID (NPWP)</span>
            <span className="text-[14px] text-on-surface font-mono font-bold tracking-wider">ID-94820384-1</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold">Nama Bisnis</span>
            <span className="text-[14px] text-on-surface font-bold tracking-wide">Chatly Systems Indonesia</span>
          </div>
        </div>
      </div>
    </div>
  )
}
