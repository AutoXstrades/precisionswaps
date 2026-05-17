import type { Session } from "next-auth";
import { NextResponse } from "next/server";

type RateLimitConfig = {
  limit: number;
  windowMs: number;
  keyPrefix: string;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function getIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown-ip"
  );
}

function getRateLimitKey(
  request: Request,
  config: RateLimitConfig,
  session?: Session | null,
) {
  const identity = session?.user?.id ? `user:${session.user.id}` : `ip:${getIp(request)}`;
  return `${config.keyPrefix}:${identity}`;
}

export function checkRateLimit(
  request: Request,
  config: RateLimitConfig,
  session?: Session | null,
) {
  const now = Date.now();
  const key = getRateLimitKey(request, config, session);
  const currentBucket = buckets.get(key);

  if (!currentBucket || currentBucket.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });

    return null;
  }

  currentBucket.count += 1;

  if (currentBucket.count <= config.limit) {
    return null;
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((currentBucket.resetAt - now) / 1000),
  );

  return NextResponse.json(
    {
      error: "Too many requests. Try again shortly.",
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}

export const rateLimitConfigs = {
  auth: {
    keyPrefix: "auth",
    limit: 20,
    windowMs: 60_000,
  },
  signup: {
    keyPrefix: "signup",
    limit: 5,
    windowMs: 60_000,
  },
  agent: {
    keyPrefix: "agent",
    limit: 12,
    windowMs: 60_000,
  },
  admin: {
    keyPrefix: "admin",
    limit: 60,
    windowMs: 60_000,
  },
  builds: {
    keyPrefix: "builds",
    limit: 30,
    windowMs: 60_000,
  },
} satisfies Record<string, RateLimitConfig>;
