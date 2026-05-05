'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useSubscription } from '@/hooks/use-subscription'
import type { SubscriptionStateResponse } from '@/types/subscription.md'

interface SubscriptionContextValue {
    data: SubscriptionStateResponse | null
    isLoading: boolean
    error: string | null
    refresh: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null)

export function SubscriptionProvider({ businessId, children }: { businessId: string; children: ReactNode }) {
    const value = useSubscription(businessId)

    return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export function useSubscriptionContext(): SubscriptionContextValue {
    const ctx = useContext(SubscriptionContext)
    if (!ctx) {
        throw new Error('useSubscriptionContext must be used within <SubscriptionProvider>')
    }
    return ctx
}
