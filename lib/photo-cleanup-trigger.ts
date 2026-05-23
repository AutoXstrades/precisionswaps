import { headers } from "next/headers";
import { auth } from "@/auth";
import { log } from "@/lib/log";

const DAY_MS = 24 * 60 * 60 * 1000;
let lastPhotoCleanupTriggerAt = 0;

export async function triggerDailyPhotoCleanup() {
  const now = Date.now();

  if (now - lastPhotoCleanupTriggerAt < DAY_MS) {
    return;
  }

  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return;
  }

  lastPhotoCleanupTriggerAt = now;

  try {
    const headerStore = await headers();
    const host = headerStore.get("host");
    const cookie = headerStore.get("cookie") ?? "";
    const protocol = headerStore.get("x-forwarded-proto") ?? "http";

    if (!host) {
      return;
    }

    void fetch(`${protocol}://${host}/api/system/cleanup-photos`, {
      method: "POST",
      cache: "no-store",
      headers: cookie ? { cookie } : undefined,
    }).catch(() => {
      log.warn("Daily build photo cleanup trigger failed");
    });
  } catch {
    log.warn("Daily build photo cleanup trigger could not start");
  }
}