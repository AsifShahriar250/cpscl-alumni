import bcrypt from "bcrypt";
import { prisma } from "../src/config/database.js";

async function main() {
  const email = "capacity-check-2@cpscl.local";
  const password = "CapacityCheck-2026-Test!";
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log("Test user already exists; no changes made.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        status: "APPROVED",
        emailVerifiedAt: new Date(),
      },
    });

    const role = await tx.role.findUnique({
      where: { name: "ALUMNI" },
    });

    if (!role) throw new Error("ALUMNI role not found");

    await tx.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
      },
    });
  });

  console.log("Capacity test user created:", email);
  console.log("Temporary test password:", password);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
