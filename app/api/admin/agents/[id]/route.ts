import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { agentUpdateSchema, updateAgent } from "@/lib/admin";
import { withApiHandler, validationError } from "@/lib/api-handler";
import { log } from "@/lib/log";
import { checkRateLimit, rateLimitConfigs } from "@/lib/rate-limit";
import { sanitizeAgent } from "@/lib/sanitize";

type AdminAgentRouteProps = {
  params: Promise<{
    id: string;
  }>;
};
const paramsSchema = z.object({
  id: z.string().trim().min(1),
});

export const PATCH = withApiHandler(async (
  request: Request,
  { params }: AdminAgentRouteProps,
) => {
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

  const body = await request.json().catch(() => null);
  const parsedBody = agentUpdateSchema.safeParse(body);

  if (!parsedBody.success) {
    return validationError(parsedBody.error);
  }

  const parsedParams = paramsSchema.safeParse(await params);

  if (!parsedParams.success) {
    return validationError(parsedParams.error);
  }

  const { id } = parsedParams.data;

  try {
    const agent = await updateAgent(id, parsedBody.data);
    log.info("Agent config updated", {
      agentId: id,
      adminUserId: session.user.id,
    });
    return NextResponse.json({ agent: sanitizeAgent(agent) });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    throw error;
  }
});
