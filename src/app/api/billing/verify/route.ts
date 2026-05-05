import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/utils/auth/auth'
import { verifyPaymentByExternalId } from '@/lib/utils/payment-gateway/billing-service'

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() })
        if (!session?.user) {
            return NextResponse.json({ message: 'Tidak terautentikasi' }, { status: 401 })
        }

        const body = await request.json()
        const { externalId } = body

        if (!externalId) {
            return NextResponse.json({ message: 'External ID diperlukan' }, { status: 400 })
        }

        const result = await verifyPaymentByExternalId(session.user.id, externalId)
        if (!result) {
            return NextResponse.json({ message: 'Transaksi tidak ditemukan' }, { status: 404 })
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error('[POST /api/billing/verify]', error)
        return NextResponse.json({ message: 'Gagal memverifikasi pembayaran' }, { status: 500 })
    }
}
