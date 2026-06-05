import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";
import { canonicalizePhone } from "@/lib/utils/phone";
import type {
  IgnoredContactDTO,
  AddIgnoredContactRequest,
} from "@/types/ignore-list.md";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function authorizeBusiness(
  businessId: string
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { userId: true },
  });
  if (!business || business.userId !== session.user.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true };
}

function toDTO(contact: {
  id: string;
  phoneNumber: string;
  label: string | null;
  createdAt: Date;
}): IgnoredContactDTO {
  return {
    id: contact.id,
    phoneNumber: contact.phoneNumber,
    label: contact.label,
    createdAt: contact.createdAt.toISOString(),
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const { id: businessId } = await context.params;
  const authResult = await authorizeBusiness(businessId);
  if (!authResult.ok) return authResult.response;

  const contacts = await prisma.ignoredContact.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    select: { id: true, phoneNumber: true, label: true, createdAt: true },
  });

  return NextResponse.json({ ignoreList: contacts.map(toDTO) });
}

export async function POST(request: Request, context: RouteContext) {
  const { id: businessId } = await context.params;
  const authResult = await authorizeBusiness(businessId);
  if (!authResult.ok) return authResult.response;

  let body: AddIgnoredContactRequest;
  try {
    body = (await request.json()) as AddIgnoredContactRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const phoneNumber = canonicalizePhone(body.phoneNumber ?? "");
  if (!phoneNumber) {
    return NextResponse.json(
      { error: "Nomor telepon tidak valid" },
      { status: 400 }
    );
  }

  const label = body.label?.trim() || null;

  const contact = await prisma.ignoredContact.upsert({
    where: { businessId_phoneNumber: { businessId, phoneNumber } },
    update: { label },
    create: { businessId, phoneNumber, label },
    select: { id: true, phoneNumber: true, label: true, createdAt: true },
  });

  return NextResponse.json({ contact: toDTO(contact) }, { status: 201 });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id: businessId } = await context.params;
  const authResult = await authorizeBusiness(businessId);
  if (!authResult.ok) return authResult.response;

  let body: { phoneNumber?: string; id?: string };
  try {
    body = (await request.json()) as { phoneNumber?: string; id?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.id) {
    await prisma.ignoredContact.deleteMany({
      where: { id: body.id, businessId },
    });
    return NextResponse.json({ success: true });
  }

  const phoneNumber = canonicalizePhone(body.phoneNumber ?? "");
  if (!phoneNumber) {
    return NextResponse.json(
      { error: "Nomor telepon tidak valid" },
      { status: 400 }
    );
  }

  await prisma.ignoredContact.deleteMany({
    where: { businessId, phoneNumber },
  });

  return NextResponse.json({ success: true });
}
