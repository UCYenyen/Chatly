'use client'

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useWallet } from '@/hooks/use-wallet'
import type { WalletStateResponse, TopUpRequest, TopUpResponse } from '@/types/wallet.md'

interface WalletContextValue {
    data: WalletStateResponse | null
    isLoading: boolean
    error: string | null
    topUp: (request: TopUpRequest) => Promise<TopUpResponse | null>
    refresh: () => Promise<void>
}

const WalletContext = createContext<WalletContextValue | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
    const value = useWallet()
    const { refresh } = value
    const router = useRouter()
    const searchParams = useSearchParams()
    const handledRef = useRef<boolean>(false)

    useEffect(() => {
        if (handledRef.current) return
        const ext = searchParams.get('ext')
        const paid = searchParams.get('paid')
        if (!ext || paid !== '1') return

        handledRef.current = true
        ;(async () => {
            try {
                await fetch('/api/billing/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ externalId: ext }),
                })
            } finally {
                await refresh()
                router.replace('/billing')
            }
        })()
    }, [searchParams, refresh, router])

    return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWalletContext(): WalletContextValue {
    const ctx = useContext(WalletContext)
    if (!ctx) {
        throw new Error('useWalletContext must be used within <WalletProvider>')
    }
    return ctx
}
