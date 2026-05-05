import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/utils/auth/auth'
import prisma from '@/lib/utils/prisma'
import type { WalletStateResponse, PaymentDTO } from '@/types/wallet.md'

export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() })
        if (!session?.user) {
            return NextResponse.json({ message: 'Tidak terautentikasi' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                payments: {
                    orderBy: { createdAt: 'desc' },
                    include: { business: { select: { name: true } } }
                }
            }
        })

        if (!user) {
            return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 })
        }

        const payments: PaymentDTO[] = user.payments.map((p) => ({
            id: p.id,
            type: p.type,
            plan: p.plan,
            amount: p.amount,
            currency: p.currency,
            status: p.status,
            invoiceUrl: p.invoiceUrl,
            xenditExternalId: p.xenditExternalId,
            businessId: p.businessId,
            businessName: p.business?.name,
            paidAt: p.paidAt?.toISOString() ?? null,
            createdAt: p.createdAt.toISOString(),
        }))

        const response: WalletStateResponse = {
            balance: user.balance,
            payments
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('[GET /api/billing/wallet] Error details:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        })
        return NextResponse.json({ message: 'Gagal memuat data dompet' }, { status: 500 })
    }
}
