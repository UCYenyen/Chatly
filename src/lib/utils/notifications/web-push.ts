import webpush from "web-push";
import prisma from "@/lib/utils/prisma";
import type { HandoverPushPayload } from "@/types/notifications.md";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@chatly.app";

let vapidConfigured = false;

function ensureVapidConfigured(): boolean {
  if (vapidConfigured) return true;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn(
      "[web-push] VAPID keys missing — push notifications are disabled.",
    );
    return false;
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  vapidConfigured = true;
  return true;
}

export function getVapidPublicKey(): string | null {
  return VAPID_PUBLIC_KEY ?? null;
}

export function isWebPushConfigured(): boolean {
  return Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
}

interface PushTarget {
  id: string;
  endpoint: string;
  p256dh: string;
  authKey: string;
}

function isGoneStatus(statusCode: number | undefined): boolean {
  return statusCode === 404 || statusCode === 410;
}

export async function sendPushToDevices(
  devices: ReadonlyArray<PushTarget>,
  payload: HandoverPushPayload,
): Promise<{ delivered: number; pruned: number }> {
  if (!ensureVapidConfigured() || devices.length === 0) {
    return { delivered: 0, pruned: 0 };
  }

  const body = JSON.stringify(payload);
  const staleDeviceIds: string[] = [];
  let delivered = 0;

  await Promise.all(
    devices.map(async (device) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: device.endpoint,
            keys: { p256dh: device.p256dh, auth: device.authKey },
          },
          body,
        );
        delivered += 1;
      } catch (error) {
        const statusCode =
          typeof error === "object" && error !== null && "statusCode" in error
            ? (error as { statusCode?: number }).statusCode
            : undefined;
        if (isGoneStatus(statusCode)) {
          staleDeviceIds.push(device.id);
        } else {
          console.error(
            `[web-push] Send failed for device ${device.id} (status ${statusCode ?? "unknown"})`,
          );
        }
      }
    }),
  );

  if (staleDeviceIds.length > 0) {
    await prisma.notificationDevice.deleteMany({
      where: { id: { in: staleDeviceIds } },
    });
  }

  return { delivered, pruned: staleDeviceIds.length };
}
