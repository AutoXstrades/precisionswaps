import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireCustomer() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "CUSTOMER") {
    redirect("/admin/dashboard");
  }

  return session;
}

export const updateBuildSchema = z
  .object({
    vehicle_year: z.coerce.number().int().min(1900).max(2100),
    vehicle_make: z.string().trim().min(1).max(80),
    vehicle_model: z.string().trim().min(1).max(80),
    engine_status: z.string().trim().min(1).max(240),
    goal: z.enum(["DAILY", "STREET", "DRAG", "SHOW"]),
    notes: z.string().trim().max(4000).optional().nullable(),
    estimate_min: z.coerce.number().int().min(0).max(250000).optional().nullable(),
    estimate_max: z.coerce.number().int().min(0).max(250000).optional().nullable(),
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

export type UpdateBuildInput = z.infer<typeof updateBuildSchema>;

export async function getBuildForEdit(buildId: string, userId: string) {
  return prisma.build.findFirst({
    where: {
      id: buildId,
      userId,
    },
    select: {
      id: true,
      vehicleYear: true,
      vehicleMake: true,
      vehicleModel: true,
      engineStatus: true,
      goal: true,
      notes: true,
      estimateMin: true,
      estimateMax: true,
      updatedAt: true,
    },
  });
}

export async function updateBuild(
  buildId: string,
  data: UpdateBuildInput & { userId: string },
) {
  const existingBuild = await prisma.build.findFirst({
    where: {
      id: buildId,
      userId: data.userId,
    },
    select: {
      id: true,
    },
  });

  if (!existingBuild) {
    return null;
  }

  return prisma.build.update({
    where: {
      id: buildId,
    },
    data: {
      vehicleYear: data.vehicle_year,
      vehicleMake: data.vehicle_make,
      vehicleModel: data.vehicle_model,
      engineStatus: data.engine_status,
      goal: data.goal,
      notes: data.notes || null,
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
      notes: true,
      estimateMin: true,
      estimateMax: true,
      updatedAt: true,
    },
  });
}
