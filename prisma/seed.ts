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

  const universalPartGroups = [
    {
      name: "Cooling System",
      parts: [
        ["LS swap radiator", "Universal planning item; confirm vehicle width, hose routing, and fan clearance.", true],
        ["Dual electric fan relay kit", "Use only after amp draw and wiring layout are confirmed.", true],
      ],
    },
    {
      name: "Transmission Cooling",
      parts: [
        ["Stacked-plate transmission cooler", "Recommended for automatic street and daily builds.", true],
      ],
    },
    {
      name: "Steam Vent System",
      parts: [
        ["LS steam vent routing kit", "Confirm intake, radiator, and throttle-body routing before ordering.", true],
      ],
    },
    {
      name: "Shifter Options",
      parts: [
        ["Universal automatic shifter", "Pending exact console/floor fitment approval.", false],
      ],
    },
    {
      name: "Driveshaft",
      parts: [
        ["Driveshaft measurement worksheet", "Required before final driveshaft quote or order.", true],
      ],
    },
    {
      name: "Fluids",
      parts: [
        ["Initial startup fluid package", "Oil, coolant, transmission fluid, and power steering fluid planning item.", true],
      ],
    },
    {
      name: "Universal Parts",
      parts: [
        ["Weatherproof fuse and relay center", "General LS swap wiring support item.", true],
        ["Heat sleeve assortment", "Protect starter, O2, and transmission wiring near exhaust heat.", true],
      ],
    },
  ] as const;

  for (const groupSeed of universalPartGroups) {
    const group = await prisma.universalPartGroup.upsert({
      where: { name: groupSeed.name },
      update: {},
      create: { name: groupSeed.name },
    });

    for (const [name, description, approved] of groupSeed.parts) {
      await prisma.universalPart.upsert({
        where: {
          groupId_name: {
            groupId: group.id,
            name,
          },
        },
        update: {
          description,
          approved,
        },
        create: {
          groupId: group.id,
          name,
          description,
          approved,
        },
      });
    }
  }

  await prisma.adminNotification.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {
      resolved: false,
      metadata: {
        platform: "GM G-Body",
        years: "1978-1988",
        examples: ["Cutlass", "Monte Carlo", "Regal", "Malibu", "Grand Prix"],
        note: "Seed placeholder for future vehicle-specific approved parts.",
      },
    },
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      type: "NEW_VEHICLE_REQUEST",
      message: "G-Body seed data is ready for vehicle-specific parts expansion.",
      metadata: {
        platform: "GM G-Body",
        years: "1978-1988",
        examples: ["Cutlass", "Monte Carlo", "Regal", "Malibu", "Grand Prix"],
        note: "Seed placeholder for future vehicle-specific approved parts.",
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
