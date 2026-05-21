import { defineConfig } from "prisma/config";
import { existsSync, readFileSync } from "node:fs";

function loadLocalEnvIfMissing() {
  if (process.env.DATABASE_URL || !existsSync(".env.local")) {
    return;
  }

  const localEnv = readFileSync(".env.local", "utf8");

  for (const line of localEnv.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;

    if (process.env[key]) {
      continue;
    }

    process.env[key] = rawValue.trim().replace(/^"|"$/g, "");
  }
}

loadLocalEnvIfMissing();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
