import { NextResponse } from "next/server";
import prisma from "@/lib/utils/prisma";
import { auth } from "@/lib/utils/auth/auth";
import { headers } from "next/headers";
import { syncPendingCustomerTransactions } from "@/lib/utils/payment-gateway/billing-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
  }

  // Verify business ownership
  const business = await prisma.business.findUnique({
    where: { id, userId: session.user.id },
  });

  if (!business) {
    return NextResponse.json({ message: "Bisnis tidak ditemukan" }, { status: 404 });
  }

  try {
    // Sync any pending transactions with Xendit before returning data
    // This ensures statuses are up-to-date even if the webhook callback was missed
    await syncPendingCustomerTransactions(id);

    const transactions = await prisma.customerTransaction.findMany({
      where: { businessId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("[GET transactions]", error);
    return NextResponse.json({ message: "Gagal mengambil data transaksi" }, { status: 500 });
  }
}
