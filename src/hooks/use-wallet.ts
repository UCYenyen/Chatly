'use client'

import { useCallback, useEffect, useState } from 'react'
import type { WalletStateResponse, TopUpRequest, TopUpResponse } from '@/types/wallet.md'
import type { ApiErrorResponse } from '@/types/subscription.md'

interface UseWalletResult {
    data: WalletStateResponse | null
    isLoading: boolean
    error: string | null
    topUp: (request: TopUpRequest) => Promise<TopUpResponse | null>
    refresh: () => Promise<void>
}

export function useWallet(): UseWalletResult {
    const [data, setData] = useState<WalletStateResponse | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const refresh = useCallback(async (): Promise<void> => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/billing/wallet', {
                method: 'GET',
                cache: 'no-store',
            })
            if (!res.ok) {
                const body = (await res.json()) as ApiErrorResponse
                throw new Error(body.message)
            }
            const json = (await res.json()) as WalletStateResponse
            setData(json)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat data dompet')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const topUp = async (request: TopUpRequest): Promise<TopUpResponse | null> => {
        try {
            const res = await fetch('/api/billing/topup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            })
            if (!res.ok) {
                const body = (await res.json()) as ApiErrorResponse
                throw new Error(body.message)
            }
            return (await res.json()) as TopUpResponse
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memproses top up')
            return null
        }
    }

    useEffect(() => {
        void refresh()
    }, [refresh])

    return { data, isLoading, error, topUp, refresh }
}
