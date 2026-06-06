import type { NotificationAdmin } from "@prisma/client";
import type { NotificationAdminDTO } from "@/types/notifications.md";
import { buildInviteUrl } from "./urls";

export function toNotificationAdminDTO(
  admin: NotificationAdmin & { _count: { devices: number } },
): NotificationAdminDTO {
  return {
    id: admin.id,
    label: admin.label,
    status: admin.status,
    deviceCount: admin._count.devices,
    inviteUrl: buildInviteUrl(admin.inviteToken),
    lastAssignedAt: admin.lastAssignedAt
      ? admin.lastAssignedAt.toISOString()
      : null,
    createdAt: admin.createdAt.toISOString(),
  };
}
