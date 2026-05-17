import type { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { checkRateLimit, rateLimitConfigs } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, rateLimitConfigs.auth);

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  return handlers.GET(request);
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, rateLimitConfigs.auth);

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  return handlers.POST(request);
}
