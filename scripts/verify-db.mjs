import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const [users, builds, agentLogs, agentConfigs, defaultAgents] =
    await Promise.all([
      prisma.user.count(),
      prisma.build.count(),
      prisma.agentLog.count(),
      prisma.agentConfig.count(),
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
    `Default agent configs: ${defaultAgents
      .map((agent) => `${agent.id}:${agent.type}`)
      .join(", ")}`,
  );

  if (defaultAgents.length < 3) {
    throw new Error("Default agent configs are missing. Run npm run prisma:db-seed.");
  }
} finally {
  await prisma.$disconnect();
}
