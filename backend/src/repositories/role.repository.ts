import { prisma } from "../config/database.js";

export class RoleRepository {
  async findByName(
    name:
      | "SUPER_ADMIN"
      | "ADMIN"
      | "MODERATOR"
      | "EVENT_MANAGER"
      | "CONTENT_MANAGER"
      | "ALUMNI",
  ) {
    return prisma.role.findUnique({
      where: {
        name,
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.userRole.findMany({
      where: {
        userId,
      },
      include: {
        role: true,
      },
    });
  }

  async assignRole(userId: string, roleId: string) {
    return prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
      include: {
        role: true,
      },
    });
  }

  async assignAlumniRole(userId: string) {
    const alumniRole = await this.findByName("ALUMNI");

    if (!alumniRole) {
      throw new Error("ALUMNI role not found");
    }

    const existingRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId: alumniRole.id,
        },
      },
    });

    if (existingRole) {
      return existingRole;
    }

    return this.assignRole(userId, alumniRole.id);
  }
}

export const roleRepository = new RoleRepository();
