import { prisma } from "../config/database.js";
import type { PrismaClient } from "../generated/prisma/client.js";

type PrismaTransaction = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];

export class PasswordResetTokenRepository {
  async create(data: { userId: string; tokenHash: string; expiresAt: Date }) {
    return prisma.passwordResetToken.create({
      data,
    });
  }

  async findValidToken(tokenHash: string) {
    return prisma.passwordResetToken.findFirst({
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

  async invalidateUserTokens(userId: string) {
    return prisma.passwordResetToken.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });
  }

  async resetPassword(userId: string, tokenId: string, passwordHash: string) {
    return prisma.$transaction(async (tx: PrismaTransaction) => {
      const user = await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          passwordHash,
        },
      });

      await tx.passwordResetToken.update({
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

export const passwordResetTokenRepository = new PasswordResetTokenRepository();
