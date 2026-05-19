import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiHandler } from "@/lib/api-handler";
import { log } from "@/lib/log";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitConfigs } from "@/lib/rate-limit";
import { sanitizeUser } from "@/lib/sanitize";

const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(254, "Email address is too long."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long."),
});

function signupValidationError(error: z.ZodError) {
  return NextResponse.json(
    {
      error: error.issues[0]?.message ?? "Check your email and password.",
      issues: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    },
    { status: 400 },
  );
}

export const POST = withApiHandler(async (request: Request) => {
  log.info("Signup handler called");
  const rateLimitResponse = checkRateLimit(request, rateLimitConfigs.signup);

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const body = await request.json().catch(() => null);
  const parsedBody = signupSchema.safeParse(body);

  if (!parsedBody.success) {
    return signupValidationError(parsedBody.error);
  }

  const email = parsedBody.data.email.toLowerCase();

  try {
    log.info("Signup user lookup starting");
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      log.info("Signup rejected because account already exists");
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    log.info("Signup password hashing starting");
    const passwordHash = await bcrypt.hash(parsedBody.data.password, 12);

    log.info("Signup database insert starting");
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

    log.info("Signup database insert completed");
    return NextResponse.json({ user: sanitizeUser(user) }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      log.info("Signup rejected because account already exists");
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    log.error("Signup database operation failed", { error });
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
});
