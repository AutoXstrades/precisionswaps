type LogMetadata = Record<string, unknown>;

const sensitiveKeyPattern = /password|hash|token|secret|api[-_]?key|authorization|cookie/i;

function sanitizeMetadata(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeMetadata(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as LogMetadata).map(([key, item]) => [
        key,
        sensitiveKeyPattern.test(key) ? "[redacted]" : sanitizeMetadata(item),
      ]),
    );
  }

  return value;
}

function writeLog(
  level: "info" | "warn" | "error",
  message: string,
  metadata?: LogMetadata,
) {
  const payload = metadata ? sanitizeMetadata(metadata) : undefined;
  const prefix = `[PrecisionSwaps] ${level.toUpperCase()}: ${message}`;

  if (level === "error") {
    console.error(prefix, payload ?? "");
    return;
  }

  if (level === "warn") {
    console.warn(prefix, payload ?? "");
    return;
  }

  console.info(prefix, payload ?? "");
}

export const log = {
  info(message: string, metadata?: LogMetadata) {
    writeLog("info", message, metadata);
  },
  warn(message: string, metadata?: LogMetadata) {
    writeLog("warn", message, metadata);
  },
  error(message: string, metadata?: LogMetadata) {
    writeLog("error", message, metadata);
  },
};
