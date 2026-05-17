import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { adminBuildUpdateSchema, updateBuildAsAdmin } from "@/lib/admin";
import { withApiHandler, validationError } from "@/lib/api-handler";
import { log } from "@/lib/log";
import { checkRateLimit, rateLimitConfigs } from "@/lib/rate-limit";
import { sanitizeBuild } from "@/lib/sanitize";

type AdminBuildRouteProps = {
  params: Promise<{
    id: string;
  }>;
};
const paramsSchema = z.object({
  id: z.string().trim().min(1),
});

export const PATCH = withApiHandler(async (
  request: Request,
  { params }: AdminBuildRouteProps,
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
  const parsedBody = adminBuildUpdateSchema.safeParse(body);

  if (!parsedBody.success) {
    return validationError(parsedBody.error);
  }

  const parsedParams = paramsSchema.safeParse(await params);

  if (!parsedParams.success) {
    return validationError(parsedParams.error);
  }

  const { id } = parsedParams.data;
  const updatedBuild = await updateBuildAsAdmin(id, {
    ...parsedBody.data,
    adminUserId: session.user.id,
  });

  if (!updatedBuild) {
    return NextResponse.json({ error: "Build not found." }, { status: 404 });
  }

  log.info("Admin build updated", {
    buildId: id,
    adminUserId: session.user.id,
  });

  return NextResponse.json({
    build: {
      ...sanitizeBuild(updatedBuild),
      adminMeta: updatedBuild.adminMeta,
    },
  });
});
