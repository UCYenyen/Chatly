import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/utils/auth/auth'
import prisma from '@/lib/utils/prisma'
import { paySubscriptionWithWallet, getSubscriptionState } from '@/lib/utils/payment-gateway/billing-service'
import type { SubscriptionStateResponse, CreateSubscriptionRequest, CreateSubscriptionResponse } from '@/types/subscription.md'
import type { ApiErrorResponse } from '@/types/subscription.md'

export async function GET(
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

        const subscription = await prisma.subscription.findUnique({
            where: { businessId }
        })

        const response: SubscriptionStateResponse = {
            subscription: subscription ? {
                id: subscription.id,
                businessId: subscription.businessId,
                plan: subscription.plan,
                status: subscription.status,
                currentPeriodStart: subscription.currentPeriodStart?.toISOString() ?? null,
                currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
                cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
                canceledAt: subscription.canceledAt?.toISOString() ?? null,
            } : null
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('[GET /api/businesses/[id]/subscription]', error)
        return NextResponse.json({ message: 'Gagal memuat data langganan' }, { status: 500 })
    }
}

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

        const body = (await request.json()) as CreateSubscriptionRequest
        if (!body.plan || (body.plan !== "PRO" && body.plan !== "BUSINESS")) {
            return NextResponse.json({ message: 'Plan tidak valid' }, { status: 400 })
        }

        const result = await paySubscriptionWithWallet(
            session.user.id,
            businessId,
            body.plan
        )

        return NextResponse.json(result, { status: 201 })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Kesalahan tidak diketahui'
        console.error('[POST /api/businesses/[id]/subscription]', error)
        return NextResponse.json({ message }, { status: 500 })
    }
}
