import type { AgentConfig, Build, User } from "@prisma/client";

type PublicUser = Partial<
  Pick<User, "id" | "email" | "role" | "createdAt" | "updatedAt">
>;
type PublicBuild = Partial<
  Pick<
    Build,
    | "id"
    | "vehicleYear"
    | "vehicleMake"
    | "vehicleModel"
    | "engineStatus"
    | "goal"
    | "notes"
    | "aiSummary"
    | "estimateMin"
    | "estimateMax"
    | "createdAt"
    | "updatedAt"
  >
>;
type PublicAgent = Partial<
  Pick<AgentConfig, "id" | "name" | "type" | "configJson" | "createdAt" | "updatedAt">
> & {
  role?: string;
};

export function sanitizeUser(user: PublicUser) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function sanitizeBuild(build: PublicBuild) {
  return {
    id: build.id,
    vehicleYear: build.vehicleYear,
    vehicleMake: build.vehicleMake,
    vehicleModel: build.vehicleModel,
    engineStatus: build.engineStatus,
    goal: build.goal,
    notes: build.notes,
    aiSummary: build.aiSummary,
    estimateMin: build.estimateMin,
    estimateMax: build.estimateMax,
    createdAt: build.createdAt,
    updatedAt: build.updatedAt,
  };
}

export function sanitizeAgent(agent: PublicAgent) {
  return {
    id: agent.id,
    name: agent.name,
    type: agent.type,
    role: agent.role,
    configJson: agent.configJson,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
  };
}
