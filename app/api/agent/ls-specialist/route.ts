import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { withApiHandler, validationError } from "@/lib/api-handler";
import {
  askOpenAiForSpecialistResult,
  buildIntakeSchema,
} from "@/lib/ls-specialist";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitConfigs } from "@/lib/rate-limit";

export const runtime = "nodejs";

export const POST = withApiHandler(async (request: Request) => {
  const session = await auth();
  const rateLimitResponse = checkRateLimit(request, rateLimitConfigs.agent, session);

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Customer access required." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsedBody = buildIntakeSchema.safeParse(body);

  if (!parsedBody.success) {
    return validationError(parsedBody.error);
  }

  const intake = parsedBody.data;
  const result = await askOpenAiForSpecialistResult(intake);

  if (!intake.saveBuild) {
    await prisma.agentLog.createMany({
      data: [
        {
          userId: session.user.id,
          role: "user",
          content: JSON.stringify({ type: "intake_preview", intake }),
        },
        {
          userId: session.user.id,
          role: "assistant",
          content: JSON.stringify(result),
        },
      ],
    });

    return NextResponse.json(result);
  }

  if (
    !intake.vehicleYear ||
    !intake.vehicleMake ||
    !intake.vehicleModel ||
    !intake.engineStatus ||
    !intake.goal
  ) {
    return NextResponse.json(
      { error: "Vehicle, engine status, and build goal are required before saving." },
      { status: 400 },
    );
  }

  const build = await prisma.build.create({
    data: {
      userId: session.user.id,
      vehicleYear: intake.vehicleYear,
      vehicleMake: intake.vehicleMake,
      vehicleModel: intake.vehicleModel,
      engineStatus: intake.engineStatus,
      goal: intake.goal,
      notes: [
        intake.preferences.length ? `Preferences: ${intake.preferences.join(", ")}` : "",
        intake.notes ? `Notes: ${intake.notes}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      aiSummary: result.summary,
      estimateMin: result.estimateMin,
      estimateMax: result.estimateMax,
    },
    select: {
      id: true,
    },
  });

  await prisma.agentLog.createMany({
    data: [
      {
        userId: session.user.id,
        buildId: build.id,
        role: "system",
        content: "LS Swap Specialist generated a customer build ticket.",
      },
      {
        userId: session.user.id,
        buildId: build.id,
        role: "user",
        content: JSON.stringify({ type: "final_build_intake", intake }),
      },
      {
        userId: session.user.id,
        buildId: build.id,
        role: "assistant",
        content: JSON.stringify(result),
      },
    ],
  });

  return NextResponse.json({ ...result, buildId: build.id });
});
