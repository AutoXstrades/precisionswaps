import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "node:fs";

if (!process.env.DATABASE_URL && existsSync(".env.local")) {
  const localEnv = readFileSync(".env.local", "utf8");

  for (const line of localEnv.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;

    if (!process.env[key]) {
      process.env[key] = rawValue.trim().replace(/^"|"$/g, "");
    }
  }
}

const prisma = new PrismaClient();

try {
  const tableRows = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
        'universal_part_groups',
        'universal_parts',
        'admin_notifications',
        'customer_logs'
      )
  `;
  const existingTables = new Set(tableRows.map((row) => row.table_name));
  const [
    users,
    builds,
    agentLogs,
    agentConfigs,
    universalPartGroups,
    universalParts,
    adminNotifications,
    defaultAgents,
  ] =
    await Promise.all([
      prisma.user.count(),
      prisma.build.count(),
      prisma.agentLog.count(),
      prisma.agentConfig.count(),
      existingTables.has("universal_part_groups")
        ? prisma.universalPartGroup.count()
        : Promise.resolve(0),
      existingTables.has("universal_parts")
        ? prisma.universalPart.count()
        : Promise.resolve(0),
      existingTables.has("admin_notifications")
        ? prisma.adminNotification.count()
        : Promise.resolve(0),
      prisma.agentConfig.findMany({
        where: {
          id: {
            in: [
              "ls-specialist-default",
              "clawbot-supervisor-default",
              "build-gap-analyzer-default",
            ],
          },
        },
        select: {
          id: true,
          name: true,
          type: true,
        },
      }),
    ]);

  console.info("Database verification complete.");
  console.info(`Users: ${users}`);
  console.info(`Builds: ${builds}`);
  console.info(`Agent logs: ${agentLogs}`);
  console.info(`Agent configs: ${agentConfigs}`);
  console.info(
    `Extension tables present: ${Array.from(existingTables).sort().join(", ")}`,
  );
  console.info(`Universal part groups: ${universalPartGroups}`);
  console.info(`Universal parts: ${universalParts}`);
  console.info(`Admin notifications: ${adminNotifications}`);
  console.info(
    `Default agent configs: ${defaultAgents
      .map((agent) => `${agent.id}:${agent.type}`)
      .join(", ")}`,
  );

  if (defaultAgents.length < 3) {
    throw new Error("Default agent configs are missing. Run npm run prisma:db-seed.");
  }

  if (
    existingTables.has("universal_part_groups") &&
    existingTables.has("universal_parts") &&
    (universalPartGroups < 7 || universalParts < 1)
  ) {
    throw new Error("Universal parts seed data is missing. Run npm run prisma:db-seed.");
  }
} finally {
  await prisma.$disconnect();
}
