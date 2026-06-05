'use client'

import { CreditCard, Home } from 'lucide-react'
import Link from 'next/link'

export function SubscriptionHeader() {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[12px] font-mono text-outline uppercase tracking-widest font-bold">
                <Link href="/dashboard" className="hover:text-secondary-fixed transition-colors flex items-center gap-1.5">
                    <Home className="w-3 h-3" /> Utama
                </Link>
                <span>/</span>
                <span className="text-on-surface flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3" /> Langganan
                </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface tracking-tight mt-6">
                Manajemen Paket
            </h1>
            <p className="text-outline text-sm max-w-2xl leading-relaxed mt-2">
                Kelola paket berlangganan untuk unit bisnis ini. Pastikan saldo akun global Anda mencukupi untuk perpanjangan otomatis.
            </p>
        </div>
    )
}
