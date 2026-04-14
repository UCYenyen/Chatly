import { CreditCard, Wallet } from "lucide-react"

export function PaymentMethod() {
  return (
    <div className="bg-surface-container-low border border-outline-variant/15 p-8 xl:p-10 rounded-xl flex flex-col gap-6 shadow-2xl h-full">
      <span className="text-[16px] font-headline font-bold text-on-surface">Metode Pembayaran</span>
      
      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/20 rounded-xl bg-surface-container/30 p-8 text-center gap-4 hover:bg-surface-container/50 transition-colors group">
        <div className="w-14 h-14 bg-surface-container-high rounded-full flex items-center justify-center border border-outline-variant/10 shadow-inner group-hover:scale-110 transition-transform">
          <Wallet className="w-6 h-6 text-secondary-fixed" />
        </div>
        <div>
          <h3 className="font-bold text-on-surface text-[15px] mb-1">Gateway Pembayaran</h3>
          <p className="text-[12px] text-outline max-w-[200px] leading-relaxed mx-auto">
            Gunakan Midtrans Snap untuk pembayaran yang aman menggunakan e-Wallet, Virtual Account, atau Kartu Kredit.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#bff44c] text-[#141f00] hover:bg-[#a4d730] font-bold text-[13px] h-[46px] px-6 rounded-md shadow-[0_0_15px_rgba(164,215,48,0.2)] transition-transform active:scale-95 border border-[#a4d730] mt-2">
          <CreditCard className="w-4 h-4" />
          <span>Bayar Sekarang</span>
        </button>
      </div>
    </div>
  )
}
