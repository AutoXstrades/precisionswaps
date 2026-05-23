import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const customerLogMessageSchema = z.object({
  message: z.string().trim().min(1, "Message is required.").max(2000),
});

export const customerLogReviewedSchema = z.object({
  reviewed: z.boolean(),
});

export type CustomerLogMessageInput = z.infer<typeof customerLogMessageSchema>;

export function sanitizeCustomerLog(log: {
  id: string;
  buildId: string;
  senderRole: string;
  senderEmail: string;
  message: string;
  createdAt: Date;
  reviewed: boolean;
}) {
  return {
    id: log.id,
    buildId: log.buildId,
    senderRole: log.senderRole,
    senderEmail: log.senderEmail,
    message: log.message,
    timestamp: log.createdAt,
    createdAt: log.createdAt,
    reviewed: log.reviewed,
  };
}

export async function listCustomerLogsForAdmin(buildId: string) {
  const logs = await prisma.customerLog.findMany({
    where: { buildId },
    orderBy: { createdAt: "asc" },
  });

  return logs.map(sanitizeCustomerLog);
}

export async function listCustomerLogsForCustomer(buildId: string, userId: string) {
  const build = await prisma.build.findFirst({
    where: { id: buildId, userId },
    select: { id: true },
  });

  if (!build) {
    return null;
  }

  return listCustomerLogsForAdmin(buildId);
}

export async function listRecentCustomerLogContext(
  buildId: string,
  userId: string,
  take = 5,
) {
  const build = await prisma.build.findFirst({
    where: { id: buildId, userId },
    select: { id: true },
  });

  if (!build) {
    return [];
  }

  const logs = await prisma.customerLog.findMany({
    where: { buildId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      senderRole: true,
      message: true,
      createdAt: true,
    },
  });

  return logs.reverse().map((log) => ({
    senderRole: log.senderRole,
    message: log.message,
    createdAt: log.createdAt,
  }));
}

export async function createCustomerLog({
  buildId,
  senderRole,
  senderEmail,
  message,
}: {
  buildId: string;
  senderRole: "admin" | "customer";
  senderEmail: string;
  message: string;
}) {
  const log = await prisma.customerLog.create({
    data: {
      buildId,
      senderRole,
      senderEmail,
      message,
      reviewed: senderRole === "customer" ? false : true,
    },
  });

  return sanitizeCustomerLog(log);
}

export async function markCustomerLogReviewed(logId: string, reviewed: boolean) {
  const log = await prisma.customerLog.update({
    where: { id: logId },
    data: { reviewed },
  });

  return sanitizeCustomerLog(log);
}