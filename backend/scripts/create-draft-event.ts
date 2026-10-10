import { prisma } from "../src/config/database.js";

async function main() {
  const organizer = await prisma.user.findUnique({
    where: { email: "admin@cpscl.local" },
    select: { id: true },
  });

  if (!organizer) {
    throw new Error("Admin user not found");
  }

  const event = await prisma.event.create({
    data: {
      title: "CPSCL Draft Registration Test",
      slug: "cpscl-draft-registration-test",
      description: "Temporary test event for registration validation",
      category: "TEST",
      startsAt: new Date("2027-03-15T10:00:00.000Z"),
      endsAt: new Date("2027-03-15T12:00:00.000Z"),
      capacity: 5,
      organizerId: organizer.id,
      status: "DRAFT",
    },
    select: {
      id: true,
      title: true,
      status: true,
    },
  });

  console.log("Draft test event created:");
  console.log(JSON.stringify(event, null, 2));
}

main()
  .catch((error) => {
    console.error("Failed to create draft event:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
