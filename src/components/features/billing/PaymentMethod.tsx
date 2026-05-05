'use client'

import { CreditCard, Wallet, AlertCircle } from "lucide-react"
import { useWalletContext } from "./WalletProvider"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function PaymentMethod() {
  const { topUp, isLoading } = useWalletContext()
  const [isPending, setIsPending] = useState(false)

  const handleQuickTopUp = async () => {
    setIsPending(true)
    try {
      // Default quick top up of 100k
      const res = await topUp({ amount: 100000 })
      if (res?.invoiceUrl) {
        window.location.href = res.invoiceUrl
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="bg-surface-container-low border border-outline-variant/15 p-8 xl:p-10 rounded-xl flex flex-col gap-6 shadow-2xl h-full">
      <div className="flex items-center justify-between">
        <span className="text-[16px] font-headline font-bold text-on-surface">Metode Pembayaran</span>
        <div className="flex items-center gap-1.5 text-secondary-fixed bg-secondary-fixed/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
           <AlertCircle className="w-3 h-3" /> Xendit Active
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/20 rounded-xl bg-surface-container/30 p-8 text-center gap-4 hover:bg-surface-container/50 transition-colors group">
        <div className="w-14 h-14 bg-surface-container-high rounded-full flex items-center justify-center border border-outline-variant/10 shadow-inner group-hover:scale-110 transition-transform">
          <Wallet className="w-6 h-6 text-secondary-fixed" />
        </div>
        <div>
          <h3 className="font-bold text-on-surface text-[15px] mb-1">Gateway Pembayaran</h3>
          <p className="text-[12px] text-outline max-w-[200px] leading-relaxed mx-auto">
            Gunakan Xendit untuk pengisian saldo yang instan melalui e-Wallet, VA, atau Kartu Kredit.
          </p>
        </div>
        <Button 
          onClick={handleQuickTopUp}
          disabled={isPending || isLoading}
          className="flex items-center gap-2 bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed/90 font-bold text-[13px] h-[46px] px-6 rounded-md shadow-[0_0_15px_rgba(164,215,48,0.2)] transition-transform active:scale-95 border border-secondary-fixed/20 mt-2"
        >
          <CreditCard className="w-4 h-4" />
          <span>{isPending ? 'Menyiapkan...' : 'Top Up Cepat (100rb)'}</span>
        </Button>
      </div>
    </div>
  )
}
