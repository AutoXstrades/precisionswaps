import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { withApiHandler, validationError } from "@/lib/api-handler";
import { updateBuild, updateBuildSchema } from "@/lib/customer";
import { log } from "@/lib/log";
import { checkRateLimit, rateLimitConfigs } from "@/lib/rate-limit";
import { sanitizeBuild } from "@/lib/sanitize";

type BuildRouteProps = {
  params: Promise<{
    id: string;
  }>;
};
const paramsSchema = z.object({
  id: z.string().trim().min(1),
});

export const PATCH = withApiHandler(async (request: Request, { params }: BuildRouteProps) => {
  const session = await auth();
  const rateLimitResponse = checkRateLimit(request, rateLimitConfigs.builds, session);

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
  const parsedBody = updateBuildSchema.safeParse(body);

  if (!parsedBody.success) {
    return validationError(parsedBody.error);
  }

  const parsedParams = paramsSchema.safeParse(await params);

  if (!parsedParams.success) {
    return validationError(parsedParams.error);
  }

  const { id } = parsedParams.data;
  const updatedBuild = await updateBuild(id, {
    ...parsedBody.data,
    userId: session.user.id,
  });

  if (!updatedBuild) {
    return NextResponse.json({ error: "Build not found." }, { status: 404 });
  }

  log.info("Customer build updated", {
    buildId: id,
    userId: session.user.id,
  });

  return NextResponse.json({ build: sanitizeBuild(updatedBuild) });
});
