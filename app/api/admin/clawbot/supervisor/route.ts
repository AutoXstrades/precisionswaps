import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateClawbotSupervisorReport } from "@/lib/clawbot-supervisor";
import { withApiHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitConfigs } from "@/lib/rate-limit";

export const runtime = "nodejs";

export const POST = withApiHandler(async (request: Request) => {
  const session = await auth();
  const rateLimitResponse = checkRateLimit(request, rateLimitConfigs.admin, session);

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const builds = await prisma.build.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { email: true },
      },
    },
  });
  const result = await generateClawbotSupervisorReport(builds);
  const log = await prisma.agentLog.create({
    data: {
      userId: session.user.id,
      role: "assistant",
      content: JSON.stringify({
        type: "clawbot_supervisor_report",
        title: result.title,
        report: result.report,
        buildCount: builds.length,
      }),
    },
    select: {
      createdAt: true,
    },
  });

  return NextResponse.json({
    ...result,
    createdAt: log.createdAt,
  });
});
