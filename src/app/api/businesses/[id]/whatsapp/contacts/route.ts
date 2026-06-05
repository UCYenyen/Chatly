import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";
import { fetchGowaContacts } from "@/lib/utils/whatsapp";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: businessId } = await context.params;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { userId: true },
  });
  if (!business || business.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const whatsappAuth = await prisma.whatsAppAuth.findFirst({
    where: { businessId },
    select: { instanceKey: true, status: true },
  });

  if (!whatsappAuth?.instanceKey || whatsappAuth.status !== "AUTHENTICATED") {
    return NextResponse.json(
      { error: "WhatsApp belum terhubung" },
      { status: 409 }
    );
  }

  try {
    const contacts = await fetchGowaContacts(whatsappAuth.instanceKey);
    return NextResponse.json({ contacts });
  } catch (err) {
    console.error("[whatsapp/contacts:GET] failed:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? `Gagal memuat kontak WhatsApp: ${err.message}`
            : "Gagal memuat kontak WhatsApp",
      },
      { status: 502 }
    );
  }
}
