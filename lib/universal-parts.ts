import { z } from "zod";
import { createAdminNotification } from "@/lib/admin-notifications";
import { prisma } from "@/lib/prisma";

export const universalPartUpdateSchema = z.object({
  approved: z.boolean().optional(),
  description: z.string().trim().max(1200).nullable().optional(),
});

export type UniversalPartUpdateInput = z.infer<typeof universalPartUpdateSchema>;

export function sanitizeUniversalPart(part: {
  id: string;
  groupId: string;
  name: string;
  description: string | null;
  approved: boolean;
  createdAt: Date;
}) {
  return {
    id: part.id,
    groupId: part.groupId,
    name: part.name,
    description: part.description,
    approved: part.approved,
    status: part.approved ? "Approved" : "Pending Admin Approval",
    createdAt: part.createdAt,
  };
}

export function sanitizeUniversalPartGroup(group: {
  id: string;
  name: string;
  createdAt: Date;
  parts: Array<Parameters<typeof sanitizeUniversalPart>[0]>;
}) {
  return {
    id: group.id,
    name: group.name,
    createdAt: group.createdAt,
    parts: group.parts.map(sanitizeUniversalPart),
  };
}

export async function listUniversalPartGroups() {
  const groups = await prisma.universalPartGroup
    .findMany({
      orderBy: { name: "asc" },
      include: {
        parts: {
          orderBy: [{ approved: "asc" }, { name: "asc" }],
        },
      },
    })
    .catch(() => []);

  return groups.map(sanitizeUniversalPartGroup);
}

export async function countPendingUniversalParts() {
  return prisma.universalPart
    .count({ where: { approved: false } })
    .catch(() => 0);
}

export async function updateUniversalPart(
  partId: string,
  data: UniversalPartUpdateInput,
) {
  const part = await prisma.universalPart.update({
    where: { id: partId },
    data,
  });

  return sanitizeUniversalPart(part);
}

export async function getUniversalPartsForAgent() {
  const groups = await listUniversalPartGroups();
  const approved = groups.flatMap((group) =>
    group.parts
      .filter((part) => part.approved)
      .map((part) => ({
        group: group.name,
        name: part.name,
        description: part.description,
        status: part.status,
      })),
  );
  const pending = groups.flatMap((group) =>
    group.parts
      .filter((part) => !part.approved)
      .map((part) => ({
        group: group.name,
        name: part.name,
        description: part.description,
        status: part.status,
      })),
  );

  return { groups, approved, pending };
}

export async function auditUniversalPartsForNotifications() {
  const groups = await listUniversalPartGroups();
  const emptyGroups = groups.filter((group) => group.parts.length === 0);
  const pendingParts = groups.flatMap((group) =>
    group.parts
      .filter((part) => !part.approved)
      .map((part) => ({ group: group.name, part: part.name, partId: part.id })),
  );

  await Promise.all([
    ...emptyGroups.map((group) =>
      createAdminNotification({
        type: "PART_GROUP_EMPTY",
        message: `Universal part group "${group.name}" has no parts.`,
        metadata: { groupId: group.id, groupName: group.name },
      }),
    ),
    ...pendingParts.map((item) =>
      createAdminNotification({
        type: "UNIVERSAL_PART_UNAPPROVED",
        message: `Universal part "${item.part}" is pending admin approval.`,
        metadata: item,
      }),
    ),
  ]);

  return {
    emptyGroupCount: emptyGroups.length,
    pendingPartCount: pendingParts.length,
  };
}
