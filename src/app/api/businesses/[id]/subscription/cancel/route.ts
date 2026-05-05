import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/utils/auth/auth'
import prisma from '@/lib/utils/prisma'
import { cancelSubscription } from '@/lib/utils/payment-gateway/billing-service'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: businessId } = await params
        const session = await auth.api.getSession({ headers: await headers() })
        if (!session?.user) {
            return NextResponse.json({ message: 'Tidak terautentikasi' }, { status: 401 })
        }

        // Verify user owns the business
        const business = await prisma.business.findUnique({
            where: { id: businessId, userId: session.user.id }
        })
        if (!business) {
            return NextResponse.json({ message: 'Bisnis tidak ditemukan' }, { status: 404 })
        }

        await cancelSubscription(businessId)

        return NextResponse.json({ ok: true })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Kesalahan tidak diketahui'
        console.error('[POST /api/businesses/[id]/subscription/cancel]', error)
        return NextResponse.json({ message }, { status: 500 })
    }
}
