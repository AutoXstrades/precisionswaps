import { NextResponse } from "next/server";
import { withApiHandler, validationError } from "@/lib/api-handler";
import {
  createCustomerLog,
  customerLogMessageSchema,
  listCustomerLogsForCustomer,
} from "@/lib/customer-logs";
import { requireCustomer } from "@/lib/customer";

type RouteContext = {
  params: Promise<{ buildId: string }>;
};

export const runtime = "nodejs";

export const GET = withApiHandler(async (_request: Request, context: RouteContext) => {
  const session = await requireCustomer();
  const { buildId } = await context.params;
  const logs = await listCustomerLogsForCustomer(buildId, session.user.id);

  if (!logs) {
    return NextResponse.json({ error: "Build not found." }, { status: 404 });
  }

  return NextResponse.json({ logs });
});

export const POST = withApiHandler(async (request: Request, context: RouteContext) => {
  const session = await requireCustomer();
  const { buildId } = await context.params;
  const existingLogs = await listCustomerLogsForCustomer(buildId, session.user.id);

  if (!existingLogs) {
    return NextResponse.json({ error: "Build not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsedBody = customerLogMessageSchema.safeParse(body);

  if (!parsedBody.success) {
    return validationError(parsedBody.error);
  }

  const log = await createCustomerLog({
    buildId,
    senderRole: "customer",
    senderEmail: session.user.email ?? "customer",
    message: parsedBody.data.message,
  });

  return NextResponse.json({ log }, { status: 201 });
});