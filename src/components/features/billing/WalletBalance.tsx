'use client'

import { useState } from 'react'
import { Plus, Wallet } from 'lucide-react'
import { useWalletContext } from './WalletProvider'
import { formatIDR } from './billing-format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function WalletBalance() {
    const { data, isLoading, topUp } = useWalletContext()
    const [amount, setAmount] = useState<string>('')
    const [isProcessing, setIsProcessing] = useState(false)

    const handleTopUp = async () => {
        const val = parseInt(amount)
        if (isNaN(val) || val < 10000) {
            toast.error('Minimal top up adalah Rp 10.000')
            return
        }

        setIsProcessing(true)
        const res = await topUp({ amount: val })
        setIsProcessing(false)

        if (res?.invoiceUrl) {
            window.location.href = res.invoiceUrl
        }
    }

    return (
        <div className="bg-surface-container-low border border-outline-variant/15 border-t-4 border-t-secondary-fixed p-8 xl:p-10 rounded-xl flex flex-col gap-8 shadow-2xl relative overflow-hidden h-full">
            <div className="flex items-start justify-between relative z-10 w-full">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-mono text-secondary-fixed uppercase tracking-widest font-bold">
                        Saldo Akun (Wallet)
                    </span>
                    <div className="flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-secondary-fixed" />
                        <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight">
                            {isLoading ? '...' : formatIDR(data?.balance ?? 0)}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 pt-6 border-t border-outline-variant/10 relative z-10">
                <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold">
                    Top Up Saldo
                </span>
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm font-bold">
                            Rp
                        </span>
                        <Input
                            type="number"
                            placeholder="Jumlah (min. 10.000)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-surface-container-high/50 border-outline-variant/10 pl-12 h-11"
                        />
                    </div>
                    <Button
                        disabled={isProcessing || !amount}
                        onClick={handleTopUp}
                        className="bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed/90 h-11 px-6 font-bold"
                    >
                        {isProcessing ? 'Memproses...' : <><Plus className="w-4 h-4 mr-2" /> Top Up</>}
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {[50000, 100000, 250000, 500000].map((val) => (
                        <button
                            key={val}
                            onClick={() => setAmount(val.toString())}
                            className="text-[11px] font-bold px-3 py-1.5 rounded-md border border-outline-variant/20 hover:border-secondary-fixed hover:text-secondary-fixed transition-colors bg-surface-container"
                        >
                            +{formatIDR(val)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
