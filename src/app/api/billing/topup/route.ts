import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/utils/auth/auth'
import { createTopUpInvoice } from '@/lib/utils/payment-gateway/billing-service'
import type { TopUpRequest, TopUpResponse } from '@/types/wallet.md'
import type { ApiErrorResponse } from '@/types/subscription.md'

export async function POST(request: Request): Promise<NextResponse<TopUpResponse | ApiErrorResponse>> {
    try {
        const session = await auth.api.getSession({ headers: await headers() })
        if (!session?.user) {
            return NextResponse.json({ message: 'Tidak terautentikasi' }, { status: 401 })
        }

        const body = (await request.json()) as Partial<TopUpRequest>
        if (!body.amount || body.amount < 10000) {
            return NextResponse.json({ message: 'Jumlah top up tidak valid (min. 10.000)' }, { status: 400 })
        }

        const result = await createTopUpInvoice(
            { id: session.user.id, email: session.user.email },
            body.amount
        )

        return NextResponse.json(result, { status: 201 })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Kesalahan tidak diketahui'
        console.error('[POST /api/billing/topup] Error details:', {
            message,
            stack: error instanceof Error ? error.stack : undefined,
        })
        return NextResponse.json({ message }, { status: 500 })
    }
}
