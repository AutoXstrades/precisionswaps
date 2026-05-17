export function safeRedirect(
  target: string | null | undefined,
  fallback = "/",
) {
  if (!target) {
    return fallback;
  }

  if (!target.startsWith("/") || target.startsWith("//")) {
    return fallback;
  }

  try {
    const parsedUrl = new URL(target, "http://precisionswaps.local");

    if (parsedUrl.origin !== "http://precisionswaps.local") {
      return fallback;
    }

    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch {
    return fallback;
  }
}
