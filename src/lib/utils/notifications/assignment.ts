import { randomBytes } from "crypto";
import prisma from "@/lib/utils/prisma";
import { sendPushToDevices } from "./web-push";
import { buildClaimUrl } from "./urls";
import type { HandoverAlertPushPayload } from "@/types/notifications.md";

function tagForHandover(handoverId: string): string {
  return `handover:${handoverId}`;
}

interface DeviceRow {
  id: string;
  endpoint: string;
  p256dh: string;
  authKey: string;
}

async function getLastCustomerMessage(
  businessId: string,
  phone: string,
): Promise<string> {
  const log = await prisma.chatLog.findFirst({
    where: { businessId, phone, role: "USER" },
    orderBy: { createdAt: "desc" },
    select: { content: true },
  });
  return log?.content ?? "";
}

async function eligibleAdminsOrdered(
  businessId: string,
  triedAdminIds: ReadonlyArray<string>,
): Promise<Array<{ id: string; devices: DeviceRow[] }>> {
  return prisma.notificationAdmin.findMany({
    where: {
      businessId,
      status: "ACTIVE",
      id: { notIn: [...triedAdminIds] },
      devices: { some: {} },
    },
    orderBy: [{ lastAssignedAt: { sort: "asc", nulls: "first" } }],
    select: {
      id: true,
      devices: {
        select: { id: true, endpoint: true, p256dh: true, authKey: true },
      },
    },
  });
}

async function assignNextAvailableAdmin(params: {
  handoverId: string;
  businessId: string;
  businessName: string;
  customerPhone: string;
  triedAdminIds: ReadonlyArray<string>;
}): Promise<{ assigned: boolean; adminId?: string }> {
  const lastMessage = await getLastCustomerMessage(
    params.businessId,
    params.customerPhone,
  );
  const candidates = await eligibleAdminsOrdered(
    params.businessId,
    params.triedAdminIds,
  );

  for (const admin of candidates) {
    const claimToken = randomBytes(24).toString("hex");
    const assignment = await prisma.handoverAssignment.create({
      data: {
        handoverId: params.handoverId,
        notificationAdminId: admin.id,
        claimToken,
        status: "ASSIGNED",
      },
      select: { id: true },
    });

    const payload: HandoverAlertPushPayload = {
      type: "alert",
      tag: tagForHandover(params.handoverId),
      businessName: params.businessName,
      customerPhone: params.customerPhone,
      lastMessage,
      claimUrl: buildClaimUrl(claimToken),
    };

    const result = await sendPushToDevices(admin.devices, payload);
    if (result.delivered > 0) {
      await prisma.notificationAdmin.update({
        where: { id: admin.id },
        data: { lastAssignedAt: new Date() },
      });
      return { assigned: true, adminId: admin.id };
    }

    await prisma.handoverAssignment.update({
      where: { id: assignment.id },
      data: { status: "EXPIRED" },
    });
  }

  await prisma.handover.update({
    where: { id: params.handoverId },
    data: { webPushExhausted: true },
  });
  return { assigned: false };
}

export async function assignAndPushHandover(
  handoverId: string,
): Promise<{ assigned: boolean }> {
  const handover = await prisma.handover.findUnique({
    where: { id: handoverId },
    select: {
      id: true,
      businessId: true,
      phone: true,
      status: true,
      claimedAt: true,
      webPushExhausted: true,
      business: { select: { name: true } },
      assignments: { select: { notificationAdminId: true } },
    },
  });

  if (
    !handover ||
    handover.status !== "PENDING" ||
    handover.claimedAt !== null ||
    handover.webPushExhausted
  ) {
    return { assigned: false };
  }

  return assignNextAvailableAdmin({
    handoverId: handover.id,
    businessId: handover.businessId,
    businessName: handover.business.name,
    customerPhone: handover.phone,
    triedAdminIds: handover.assignments.map((a) => a.notificationAdminId),
  });
}

async function revokePushToAdmin(
  adminId: string,
  handoverId: string,
): Promise<void> {
  const devices = await prisma.notificationDevice.findMany({
    where: { notificationAdminId: adminId },
    select: { id: true, endpoint: true, p256dh: true, authKey: true },
  });
  await sendPushToDevices(devices, {
    type: "revoke",
    tag: tagForHandover(handoverId),
  });
}

let reassignRunning = false;

export async function reassignStaleHandovers(
  now: Date = new Date(),
): Promise<void> {
  if (reassignRunning) return;
  reassignRunning = true;
  try {
    const handovers = await prisma.handover.findMany({
      where: {
        status: "PENDING",
        claimedAt: null,
        webPushExhausted: false,
        assignments: { some: { status: "ASSIGNED" } },
      },
      select: {
        id: true,
        businessId: true,
        phone: true,
        business: { select: { name: true, handoverReassignSeconds: true } },
        assignments: {
          select: {
            id: true,
            notificationAdminId: true,
            status: true,
            assignedAt: true,
          },
        },
      },
    });

    for (const handover of handovers) {
      const current = handover.assignments.find((a) => a.status === "ASSIGNED");
      if (!current) continue;

      const ageMs = now.getTime() - current.assignedAt.getTime();
      const timeoutMs = handover.business.handoverReassignSeconds * 1000;
      if (ageMs < timeoutMs) continue;

      const triedAdminIds = handover.assignments.map(
        (a) => a.notificationAdminId,
      );
      const nextCandidates = await eligibleAdminsOrdered(
        handover.businessId,
        triedAdminIds,
      );
      if (nextCandidates.length === 0) continue;

      await prisma.handoverAssignment.update({
        where: { id: current.id },
        data: { status: "SUPERSEDED" },
      });
      await revokePushToAdmin(current.notificationAdminId, handover.id);

      await assignNextAvailableAdmin({
        handoverId: handover.id,
        businessId: handover.businessId,
        businessName: handover.business.name,
        customerPhone: handover.phone,
        triedAdminIds,
      });
    }
  } catch (error) {
    console.error("[handover] Reassignment sweep failed:", error);
  } finally {
    reassignRunning = false;
  }
}

export type ClaimResult =
  | { status: "claimed"; customerPhone: string }
  | { status: "reassigned"; customerPhone: string }
  | { status: "already_handled"; customerPhone: string }
  | { status: "not_found"; customerPhone: null };

export async function claimHandover(claimToken: string): Promise<ClaimResult> {
  const assignment = await prisma.handoverAssignment.findUnique({
    where: { claimToken },
    select: {
      id: true,
      status: true,
      notificationAdminId: true,
      handover: {
        select: { id: true, phone: true, status: true, claimedAt: true },
      },
    },
  });

  if (!assignment) {
    return { status: "not_found", customerPhone: null };
  }

  const { handover } = assignment;

  if (assignment.status === "CLAIMED") {
    return { status: "claimed", customerPhone: handover.phone };
  }

  if (assignment.status !== "ASSIGNED") {
    return { status: "reassigned", customerPhone: handover.phone };
  }

  const won = await prisma.handover.updateMany({
    where: { id: handover.id, status: "PENDING", claimedAt: null },
    data: { claimedAt: new Date(), claimedByAdminId: assignment.notificationAdminId },
  });

  if (won.count !== 1) {
    return { status: "already_handled", customerPhone: handover.phone };
  }

  await prisma.handoverAssignment.update({
    where: { id: assignment.id },
    data: { status: "CLAIMED" },
  });

  return { status: "claimed", customerPhone: handover.phone };
}

export function buildWhatsAppWebDeepLink(customerPhone: string): string {
  return `https://web.whatsapp.com/send?phone=${encodeURIComponent(customerPhone)}`;
}
