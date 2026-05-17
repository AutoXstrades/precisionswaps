import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { log } from "@/lib/log";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function validationError(error: ZodError) {
  return NextResponse.json(
    {
      error: "Invalid request.",
      issues: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    },
    { status: 400 },
  );
}

export function withApiHandler<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
) {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        return jsonError(error.message, error.status);
      }

      if (error instanceof ZodError) {
        return validationError(error);
      }

      log.error("Unhandled API error", { error });

      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 },
      );
    }
  };
}
