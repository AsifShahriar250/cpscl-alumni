import { prisma } from "../config/database.js";
import type { PrismaClient } from "../generated/prisma/client.js";

type PrismaTransaction = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async approveUser(userId: string) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: "APPROVED",
      },
      select: {
        id: true,
        email: true,
        status: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(data: { email: string; passwordHash: string }) {
    return prisma.user.create({
      data,
    });
  }

  async createWithRole(
    data: {
      email: string;
      passwordHash: string;
    },
    roleName: "ALUMNI",
  ) {
    return prisma.$transaction(async (tx: PrismaTransaction) => {
      const user = await tx.user.create({
        data,
      });

      const role = await tx.role.findUnique({
        where: {
          name: roleName,
        },
      });

      if (!role) {
        throw new Error(`${roleName} role not found`);
      }

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });

      return user;
    });
  }

  async createWithRoleAndVerificationToken(
    data: {
      email: string;
      passwordHash: string;
      tokenHash: string;
      expiresAt: Date;
    },
    roleName: "ALUMNI",
  ) {
    return prisma.$transaction(async (tx: PrismaTransaction) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
        },
      });

      const role = await tx.role.findUnique({
        where: {
          name: roleName,
        },
      });

      if (!role) {
        throw new Error(`${roleName} role not found`);
      }

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });

      await tx.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash: data.tokenHash,
          expiresAt: data.expiresAt,
        },
      });

      return user;
    });
  }

  async findPendingVerificationUsers() {
    return prisma.user.findMany({
      where: {
        status: "PENDING_VERIFICATION",
      },
      select: {
        id: true,
        email: true,
        status: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async updateLastLoginAt(userId: string) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }
}

export const userRepository = new UserRepository();
