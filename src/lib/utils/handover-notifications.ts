import { sendGowaMessage } from "@/lib/utils/whatsapp";
import type { HandoverNotificationContext } from "@/types/handover.md";

const MESSAGE_SNIPPET_LIMIT = 160;

function resolveBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "";
  return base.replace(/\/+$/, "");
}

export function buildResolveUrl(token: string): string {
  return `${resolveBaseUrl()}/api/whatsapp/handover/resolve?token=${token}`;
}

function snippet(message: string): string {
  const trimmed = message.trim();
  if (trimmed.length <= MESSAGE_SNIPPET_LIMIT) {
    return trimmed;
  }
  return `${trimmed.slice(0, MESSAGE_SNIPPET_LIMIT)}…`;
}

export async function notifyHandoverEscalation(
  ctx: HandoverNotificationContext,
): Promise<void> {
  if (!ctx.notificationPhone) {
    console.warn(
      `[handover] No notificationPhone set for "${ctx.businessName}" — skipping escalation alert for ${ctx.customerPhone}.`,
    );
    return;
  }

  const message = `🔔 Pelanggan ${ctx.customerPhone} butuh kamu.\n\nPesan terakhir: "${snippet(ctx.lastMessage)}"`;
  await sendGowaMessage(ctx.notificationPhone, message, ctx.instanceKey);
}

export async function notifyHandoverReminder(
  ctx: HandoverNotificationContext,
): Promise<void> {
  if (!ctx.notificationPhone) {
    return;
  }

  const message = `⏳ Pengingat: pelanggan ${ctx.customerPhone} masih menunggu dan belum ditandai selesai.\n\nTandai selesai: ${buildResolveUrl(ctx.resolveToken)}`;
  await sendGowaMessage(ctx.notificationPhone, message, ctx.instanceKey);
}

export async function notifyHandoverTimeout(
  ctx: HandoverNotificationContext,
): Promise<void> {
  if (!ctx.notificationPhone) {
    return;
  }

  const message = `⏰ Pelanggan ${ctx.customerPhone} sudah kembali ditangani AI setelah tidak ada aktivitas — kemungkinan terlewat.`;
  await sendGowaMessage(ctx.notificationPhone, message, ctx.instanceKey);
}

export async function sendCustomerHandoverAck(
  customerPhone: string,
  instanceKey: string,
): Promise<void> {
  await sendGowaMessage(
    customerPhone,
    "👋 Sebentar ya, tim kami akan segera membalas pesan kamu.",
    instanceKey,
  );
}
