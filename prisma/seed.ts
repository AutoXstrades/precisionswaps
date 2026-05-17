import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: { passwordHash, role: "ADMIN" },
      create: {
        email: adminEmail.toLowerCase(),
        passwordHash,
        role: "ADMIN",
      },
    });
  }

  await prisma.agentConfig.upsert({
    where: { id: "ls-specialist-default" },
    update: {
      configJson: {
        tone: "direct, practical, performance-shop",
        job: "Guide customers through LS and LT swap planning and produce build tickets.",
      },
    },
    create: {
      id: "ls-specialist-default",
      name: "LS Swap Specialist",
      type: "LS_SPECIALIST",
      configJson: {
        tone: "direct, practical, performance-shop",
        job: "Guide customers through LS and LT swap planning and produce build tickets.",
      },
    },
  });

  await prisma.agentConfig.upsert({
    where: { id: "clawbot-supervisor-default" },
    update: {
      configJson: {
        job: "Aggregate build data and create owner-facing reports.",
        cadence: "manual for v1",
        workers: ["build-gap-analyzer-default"],
      },
    },
    create: {
      id: "clawbot-supervisor-default",
      name: "Clawbot Supervisor",
      type: "CLAWBOT_SUPERVISOR",
      configJson: {
        job: "Aggregate build data and create owner-facing reports.",
        cadence: "manual for v1",
        workers: ["build-gap-analyzer-default"],
      },
    },
  });

  await prisma.agentConfig.upsert({
    where: { id: "build-gap-analyzer-default" },
    update: {
      configJson: {
        job: "Analyze individual builds for missing vehicle, drivetrain, preference, and estimate details.",
        reportsTo: "clawbot-supervisor-default",
      },
    },
    create: {
      id: "build-gap-analyzer-default",
      name: "Build Gap Analyzer",
      type: "CLAWBOT_WORKER",
      configJson: {
        job: "Analyze individual builds for missing vehicle, drivetrain, preference, and estimate details.",
        reportsTo: "clawbot-supervisor-default",
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
