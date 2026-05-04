import { NextResponse } from 'next/server';
import { xenditClient } from '@/lib/utils/payment-gateway/xendit';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { Invoice } = xenditClient;

    const data = {
      externalId: `order-${Date.now()}`,
      amount: body.amount,
      payerEmail: body.email,
      description: 'Payment for Next.js App Order',
      invoiceDuration: 86400, // 24 hours in seconds
    };

    const response = await Invoice.createInvoice({ data });

    return NextResponse.json({ invoiceUrl: response.invoiceUrl });

  } catch (error: any) {
    console.error('Xendit Error:', error);
    return NextResponse.json(
      { message: 'Failed to create payment', error: error.message },
      { status: 500 }
    );
  }
}