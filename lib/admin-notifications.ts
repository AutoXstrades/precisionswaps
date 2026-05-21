import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const adminNotificationResolveSchema = z.object({
  resolved: z.boolean(),
});

export type AdminNotificationResolveInput = z.infer<
  typeof adminNotificationResolveSchema
>;

export function sanitizeAdminNotification(notification: {
  id: string;
  type: string;
  message: string;
  metadata: unknown;
  resolved: boolean;
  createdAt: Date;
}) {
  return {
    id: notification.id,
    type: notification.type,
    message: notification.message,
    metadata: notification.metadata,
    resolved: notification.resolved,
    createdAt: notification.createdAt,
  };
}

export async function listAdminNotifications(options?: { resolved?: boolean }) {
  const notifications = await prisma.adminNotification
    .findMany({
      where:
        typeof options?.resolved === "boolean"
          ? { resolved: options.resolved }
          : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    .catch(() => []);

  return notifications.map(sanitizeAdminNotification);
}

export async function countUnresolvedAdminNotifications() {
  return prisma.adminNotification
    .count({
      where: { resolved: false },
    })
    .catch(() => 0);
}

export async function createAdminNotification({
  type,
  message,
  metadata,
}: {
  type: string;
  message: string;
  metadata?: Prisma.InputJsonValue;
}) {
  const existing = await prisma.adminNotification
    .findFirst({
      where: {
        type,
        message,
        resolved: false,
      },
      select: { id: true },
    })
    .catch(() => null);

  if (existing) {
    return existing;
  }

  return prisma.adminNotification
    .create({
      data: {
        type,
        message,
        metadata,
      },
      select: { id: true },
    })
    .catch(() => null);
}

export async function resolveAdminNotification(
  notificationId: string,
  data: AdminNotificationResolveInput,
) {
  const notification = await prisma.adminNotification.update({
    where: { id: notificationId },
    data: { resolved: data.resolved },
  });

  return sanitizeAdminNotification(notification);
}
