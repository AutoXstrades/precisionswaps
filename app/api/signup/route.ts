import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiHandler, validationError } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitConfigs } from "@/lib/rate-limit";
import { sanitizeUser } from "@/lib/sanitize";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const POST = withApiHandler(async (request: Request) => {
  const rateLimitResponse = checkRateLimit(request, rateLimitConfigs.signup);

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const body = await request.json().catch(() => null);
  const parsedBody = signupSchema.safeParse(body);

  if (!parsedBody.success) {
    return validationError(parsedBody.error);
  }

  const email = parsedBody.data.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(parsedBody.data.password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "CUSTOMER",
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  return NextResponse.json({ user: sanitizeUser(user) }, { status: 201 });
});
