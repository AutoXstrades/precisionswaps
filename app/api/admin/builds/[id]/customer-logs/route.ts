import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiHandler, validationError } from "@/lib/api-handler";
import {
  createCustomerLog,
  customerLogMessageSchema,
  customerLogReviewedSchema,
  listCustomerLogsForAdmin,
  markCustomerLogReviewed,
} from "@/lib/customer-logs";
import { getBuildForAdmin, requireAdmin } from "@/lib/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const patchSchema = customerLogReviewedSchema.extend({
  id: z.string().uuid(),
});

export const runtime = "nodejs";

export const GET = withApiHandler(async (_request: Request, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  const build = await getBuildForAdmin(id);

  if (!build) {
    return NextResponse.json({ error: "Build not found." }, { status: 404 });
  }

  const logs = await listCustomerLogsForAdmin(id);
  return NextResponse.json({ logs });
});

export const POST = withApiHandler(async (request: Request, context: RouteContext) => {
  const session = await requireAdmin();
  const { id } = await context.params;
  const build = await getBuildForAdmin(id);

  if (!build) {
    return NextResponse.json({ error: "Build not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsedBody = customerLogMessageSchema.safeParse(body);

  if (!parsedBody.success) {
    return validationError(parsedBody.error);
  }

  const log = await createCustomerLog({
    buildId: id,
    senderRole: "admin",
    senderEmail: session.user.email ?? "admin",
    message: parsedBody.data.message,
  });

  return NextResponse.json({ log }, { status: 201 });
});

export const PATCH = withApiHandler(async (request: Request) => {
  await requireAdmin();
  const body = await request.json().catch(() => null);
  const parsedBody = patchSchema.safeParse(body);

  if (!parsedBody.success) {
    return validationError(parsedBody.error);
  }

  const log = await markCustomerLogReviewed(
    parsedBody.data.id,
    parsedBody.data.reviewed,
  );

  return NextResponse.json({ log });
});
