import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import { PrismaClient } from "../src/generated/prisma/client.js";

import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

const roles = [
  "SUPER_ADMIN",
  "ADMIN",
  "MODERATOR",
  "EVENT_MANAGER",
  "CONTENT_MANAGER",
  "ALUMNI",
] as const;

async function main() {
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: {
        name: roleName,
      },
      update: {},
      create: {
        name: roleName,
      },
    });

    console.log(`Role ready: ${roleName}`);
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  }

  const adminRole = await prisma.role.findUnique({
    where: {
      name: "ADMIN",
    },
  });

  if (!adminRole) {
    throw new Error("ADMIN role not found");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: {
      email: adminEmail,
    },
    update: {
      passwordHash,
      status: "APPROVED",
      emailVerifiedAt: new Date(),
    },
    create: {
      email: adminEmail,
      passwordHash,
      status: "APPROVED",
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log(`Admin user ready: ${adminUser.email}`);
  console.log("System roles seeded successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
