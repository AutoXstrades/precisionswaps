import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { adminNotificationResolveSchema, resolveAdminNotification } from "@/lib/admin-notifications";
import { withApiHandler, validationError } from "@/lib/api-handler";
import { log } from "@/lib/log";
import { checkRateLimit, rateLimitConfigs } from "@/lib/rate-limit";

type AdminNotificationRouteProps = {
  params: Promise<{ id: string }>;
};

export const PATCH = withApiHandler(
  async (request: Request, { params }: AdminNotificationRouteProps) => {
    const session = await requireAdmin();
    const rateLimitResponse = checkRateLimit(request, rateLimitConfigs.admin, session);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsedBody = adminNotificationResolveSchema.safeParse(body);

    if (!parsedBody.success) {
      return validationError(parsedBody.error);
    }

    const notification = await resolveAdminNotification(id, parsedBody.data);
    log.info("Admin notification updated", {
      notificationId: id,
      adminUserId: session.user.id,
    });

    return NextResponse.json({ notification });
  },
);
