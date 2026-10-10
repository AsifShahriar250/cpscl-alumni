import { prisma } from "../config/database.js";
import type { PrismaClient } from "../generated/prisma/client.js";

type PrismaTransaction = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];

export class EmailVerificationTokenRepository {
  async create(data: { userId: string; tokenHash: string; expiresAt: Date }) {
    return prisma.emailVerificationToken.create({
      data,
    });
  }

  async findValidToken(tokenHash: string) {
    return prisma.emailVerificationToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });
  }

  async markAsUsed(id: string) {
    return prisma.emailVerificationToken.update({
      where: {
        id,
      },
      data: {
        usedAt: new Date(),
      },
    });
  }

  async invalidateUserTokens(userId: string) {
    return prisma.emailVerificationToken.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });
  }

  async createNewToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return prisma.emailVerificationToken.create({
      data,
    });
  }

  async verifyUserEmail(userId: string, tokenId: string) {
    return prisma.$transaction(async (tx: PrismaTransaction) => {
      const user = await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          emailVerifiedAt: new Date(),
          status: "PENDING_VERIFICATION",
        },
      });

      await tx.emailVerificationToken.update({
        where: {
          id: tokenId,
        },
        data: {
          usedAt: new Date(),
        },
      });

      return user;
    });
  }
}

export const emailVerificationTokenRepository =
  new EmailVerificationTokenRepository();
