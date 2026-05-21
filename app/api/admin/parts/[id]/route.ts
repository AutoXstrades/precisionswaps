import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { withApiHandler, validationError } from "@/lib/api-handler";
import { log } from "@/lib/log";
import { checkRateLimit, rateLimitConfigs } from "@/lib/rate-limit";
import { universalPartUpdateSchema, updateUniversalPart } from "@/lib/universal-parts";

type AdminPartRouteProps = {
  params: Promise<{ id: string }>;
};

export const PATCH = withApiHandler(
  async (request: Request, { params }: AdminPartRouteProps) => {
    const session = await requireAdmin();
    const rateLimitResponse = checkRateLimit(request, rateLimitConfigs.admin, session);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsedBody = universalPartUpdateSchema.safeParse(body);

    if (!parsedBody.success) {
      return validationError(parsedBody.error);
    }

    const part = await updateUniversalPart(id, parsedBody.data);
    log.info("Universal part updated", {
      partId: id,
      adminUserId: session.user.id,
    });

    return NextResponse.json({ part });
  },
);
