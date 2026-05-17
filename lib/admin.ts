import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const adminBuildStatusSchema = z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]);

export const adminBuildUpdateSchema = z
  .object({
    status: adminBuildStatusSchema,
    estimate_min: z.coerce.number().int().min(0).max(250000).nullable().optional(),
    estimate_max: z.coerce.number().int().min(0).max(250000).nullable().optional(),
    internal_notes: z.string().trim().max(4000).nullable().optional(),
  })
  .refine(
    (data) =>
      data.estimate_min == null ||
      data.estimate_max == null ||
      data.estimate_min <= data.estimate_max,
    {
      message: "Estimate min must be less than or equal to estimate max.",
      path: ["estimate_min"],
    },
  );

export type AdminBuildStatus = z.infer<typeof adminBuildStatusSchema>;
export type AdminBuildUpdateInput = z.infer<typeof adminBuildUpdateSchema>;
export type AdminBuildFilters = {
  search?: string;
  status?: AdminBuildStatus | "ALL";
  goal?: "DAILY" | "STREET" | "DRAG" | "SHOW" | "ALL";
  sort?: "newest" | "oldest" | "updated";
};

export const agentConfigRoleSchema = z.enum(["system", "user", "assistant"]);

export const agentUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.enum(["LS_SPECIALIST", "CLAWBOT_SUPERVISOR", "CLAWBOT_WORKER"]),
  role: agentConfigRoleSchema,
  config: z.record(z.string(), z.unknown()),
});

export type AgentUpdateInput = z.infer<typeof agentUpdateSchema>;

type AdminBuildMeta = {
  status: AdminBuildStatus;
  internalNotes: string;
  updatedAt?: Date;
};

const defaultAdminMeta: AdminBuildMeta = {
  status: "ACTIVE",
  internalNotes: "",
};

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return session;
}

function parseAdminBuildMeta(content: string): AdminBuildMeta | null {
  try {
    const parsed = JSON.parse(content) as {
      type?: string;
      status?: AdminBuildStatus;
      internal_notes?: string;
    };

    if (parsed.type !== "admin_build_management") {
      return null;
    }

    return {
      status: adminBuildStatusSchema.safeParse(parsed.status).success
        ? (parsed.status as AdminBuildStatus)
        : "ACTIVE",
      internalNotes: parsed.internal_notes ?? "",
    };
  } catch {
    return null;
  }
}

function getLatestAdminMeta(
  logs: Array<{ content: string; createdAt: Date }>,
): AdminBuildMeta {
  for (const log of logs) {
    const parsedMeta = parseAdminBuildMeta(log.content);

    if (parsedMeta) {
      return {
        ...parsedMeta,
        updatedAt: log.createdAt,
      };
    }
  }

  return defaultAdminMeta;
}

export async function listBuildsWithFilters(filters: AdminBuildFilters) {
  const builds = await prisma.build.findMany({
    orderBy:
      filters.sort === "oldest"
        ? { createdAt: "asc" }
        : filters.sort === "updated"
          ? { updatedAt: "desc" }
          : { createdAt: "desc" },
    include: {
      user: {
        select: { email: true },
      },
      agentLogs: {
        where: {
          content: {
            contains: "admin_build_management",
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  const normalizedSearch = filters.search?.trim().toLowerCase();

  return builds
    .map((build) => ({
      ...build,
      adminMeta: getLatestAdminMeta(build.agentLogs),
    }))
    .filter((build) => {
      if (filters.goal && filters.goal !== "ALL" && build.goal !== filters.goal) {
        return false;
      }

      if (
        filters.status &&
        filters.status !== "ALL" &&
        build.adminMeta.status !== filters.status
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchable = [
        build.id,
        build.user.email,
        build.vehicleYear,
        build.vehicleMake,
        build.vehicleModel,
        build.engineStatus,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedSearch);
    });
}

export async function getBuildForAdmin(buildId: string) {
  const build = await prisma.build.findUnique({
    where: { id: buildId },
    include: {
      user: {
        select: { email: true, createdAt: true },
      },
      agentLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!build) {
    return null;
  }

  return {
    ...build,
    adminMeta: getLatestAdminMeta(build.agentLogs),
  };
}

export async function updateBuildAsAdmin(
  buildId: string,
  data: AdminBuildUpdateInput & { adminUserId: string },
) {
  const existingBuild = await prisma.build.findUnique({
    where: { id: buildId },
    select: { id: true },
  });

  if (!existingBuild) {
    return null;
  }

  const [updatedBuild] = await prisma.$transaction([
    prisma.build.update({
      where: { id: buildId },
      data: {
        estimateMin: data.estimate_min ?? null,
        estimateMax: data.estimate_max ?? null,
      },
      select: {
        id: true,
        vehicleYear: true,
        vehicleMake: true,
        vehicleModel: true,
        engineStatus: true,
        goal: true,
        estimateMin: true,
        estimateMax: true,
        updatedAt: true,
      },
    }),
    prisma.agentLog.create({
      data: {
        userId: data.adminUserId,
        buildId,
        role: "system",
        content: JSON.stringify({
          type: "admin_build_management",
          status: data.status,
          internal_notes: data.internal_notes ?? "",
        }),
      },
    }),
  ]);

  return {
    ...updatedBuild,
    adminMeta: {
      status: data.status,
      internalNotes: data.internal_notes ?? "",
    },
  };
}

function getAgentRoleFromConfig(configJson: unknown) {
  if (
    configJson &&
    typeof configJson === "object" &&
    !Array.isArray(configJson) &&
    "role" in configJson
  ) {
    const parsedRole = agentConfigRoleSchema.safeParse(
      (configJson as { role?: unknown }).role,
    );

    if (parsedRole.success) {
      return parsedRole.data;
    }
  }

  return "system";
}

function withAgentRole<T extends { configJson: unknown }>(agent: T) {
  return {
    ...agent,
    role: getAgentRoleFromConfig(agent.configJson),
  };
}

export async function listAgents() {
  const agents = await prisma.agentConfig.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      type: true,
      configJson: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return agents.map(withAgentRole);
}

export async function getAgentForAdmin(agentId: string) {
  const agent = await prisma.agentConfig.findUnique({
    where: { id: agentId },
    select: {
      id: true,
      name: true,
      type: true,
      configJson: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!agent) {
    return null;
  }

  return withAgentRole(agent);
}

export async function updateAgent(agentId: string, data: AgentUpdateInput) {
  const updatedAgent = await prisma.agentConfig.update({
    where: { id: agentId },
    data: {
      name: data.name,
      type: data.type,
      configJson: {
        ...data.config,
        role: data.role,
      },
    },
    select: {
      id: true,
      name: true,
      type: true,
      configJson: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return withAgentRole(updatedAgent);
}

export function formatCurrencyRange(min: number | null, max: number | null) {
  if (!min && !max) {
    return "Estimate pending";
  }

  if (min && max) {
    return `$${min.toLocaleString()}-$${max.toLocaleString()}`;
  }

  return `$${(min ?? max)?.toLocaleString()}`;
}

export function formatAdminDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
