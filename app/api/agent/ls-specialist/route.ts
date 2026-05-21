import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { withApiHandler, validationError } from "@/lib/api-handler";
import {
  askOpenAiForSpecialistReply,
  askOpenAiForSpecialistResult,
  buildIntakeSchema,
  specialistChatSchema,
} from "@/lib/ls-specialist";
import { log } from "@/lib/log";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitConfigs } from "@/lib/rate-limit";
import {
  auditUniversalPartsForNotifications,
  getUniversalPartsForAgent,
} from "@/lib/universal-parts";

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

  if (body && typeof body === "object" && "message" in body) {
    log.info("Agent chat request received");
    const parsedChat = specialistChatSchema.safeParse(body);

    if (!parsedChat.success) {
      log.info("Agent chat validation failed");
      return validationError(parsedChat.error);
    }

    const result = await askOpenAiForSpecialistReply(parsedChat.data);

    await prisma.agentLog.createMany({
      data: [
        {
          userId: session.user.id,
          role: "user",
          content: JSON.stringify({ type: "specialist_chat" }),
        },
        {
          userId: session.user.id,
          role: "assistant",
          content: JSON.stringify({ type: "specialist_chat_reply" }),
        },
      ],
    });

    log.info("Agent chat call succeeded");
    return NextResponse.json(result);
  }

  log.info("Agent intake request received");
  const parsedBody = buildIntakeSchema.safeParse(body);

  if (!parsedBody.success) {
    log.info("Agent intake validation failed");
    return validationError(parsedBody.error);
  }

  const intake = parsedBody.data;
  const [universalParts] = await Promise.all([
    getUniversalPartsForAgent(),
    auditUniversalPartsForNotifications(),
  ]);
  const result = await askOpenAiForSpecialistResult(intake, {
    approved: universalParts.approved,
    pending: universalParts.pending,
  });
  log.info("Agent intake call succeeded");

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
    log.info("Agent build save rejected because required fields are incomplete");
    return NextResponse.json(
      { error: "Vehicle, engine status, and build goal are required before saving." },
      { status: 400 },
    );
  }

  log.info("Agent build save starting");
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

  log.info("Agent build save completed");
  return NextResponse.json({ ...result, buildId: build.id });
});
