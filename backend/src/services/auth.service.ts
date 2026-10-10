import bcrypt from "bcrypt";

import { AppError } from "../errors/AppError.js";

import { emailVerificationTokenRepository } from "../repositories/email-verification-token.repository.js";
import { passwordResetTokenRepository } from "../repositories/password-reset-token.repository.js";
import { userRepository } from "../repositories/user.repository.js";

import {
  generateEmailVerificationToken,
  hashEmailVerificationToken,
} from "../utils/emailVerificationToken.js";

import {
  generatePasswordResetToken,
  hashPasswordResetToken,
} from "../utils/passwordResetToken.js";

import { signAccessToken } from "../utils/jwt.js";

import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";

const SALT_ROUNDS = 12;

const EMAIL_VERIFICATION_TOKEN_EXPIRY_MINUTES = 30;

const PASSWORD_RESET_TOKEN_EXPIRY_MINUTES = 15;

export class AuthService {
  async register(email: string, password: string) {
    const validatedData = registerSchema.parse({
      email,
      password,
    });

    const existingUser = await userRepository.findByEmail(validatedData.email);

    if (existingUser) {
      throw new AppError(
        "Email is already registered",
        409,
        "EMAIL_ALREADY_REGISTERED",
      );
    }

    const passwordHash = await bcrypt.hash(validatedData.password, SALT_ROUNDS);

    const rawVerificationToken = generateEmailVerificationToken();

    const tokenHash = hashEmailVerificationToken(rawVerificationToken);

    const expiresAt = new Date(
      Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRY_MINUTES * 60 * 1000,
    );

    const user = await userRepository.createWithRoleAndVerificationToken(
      {
        email: validatedData.email,
        passwordHash,
        tokenHash,
        expiresAt,
      },
      "ALUMNI",
    );

    return {
      id: user.id,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt,

      // Development testing only.
      // Remove before production and send this token by email.
      verificationToken: rawVerificationToken,
      verificationTokenExpiresAt: expiresAt,
    };
  }

  async login(email: string, password: string) {
    const validatedData = loginSchema.parse({
      email,
      password,
    });

    const user = await userRepository.findByEmail(validatedData.email);

    if (!user) {
      throw new AppError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS",
      );
    }

    const passwordMatches = await bcrypt.compare(
      validatedData.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new AppError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS",
      );
    }

    if (user.status === "EMAIL_UNVERIFIED") {
      throw new AppError(
        "Email verification required",
        403,
        "EMAIL_VERIFICATION_REQUIRED",
      );
    }

    if (user.status === "PENDING_VERIFICATION") {
      throw new AppError(
        "Account verification is pending",
        403,
        "ACCOUNT_VERIFICATION_PENDING",
      );
    }

    if (user.status === "REJECTED") {
      throw new AppError(
        "Account registration was rejected",
        403,
        "ACCOUNT_REJECTED",
      );
    }

    if (user.status === "CORRECTION_REQUIRED") {
      throw new AppError(
        "Account correction is required",
        403,
        "ACCOUNT_CORRECTION_REQUIRED",
      );
    }

    if (user.status === "SUSPENDED") {
      throw new AppError("Account is suspended", 403, "ACCOUNT_SUSPENDED");
    }

    if (user.status === "INACTIVE") {
      throw new AppError("Account is inactive", 403, "ACCOUNT_INACTIVE");
    }

    if (user.status === "DELETED") {
      throw new AppError("Account is deleted", 403, "ACCOUNT_DELETED");
    }

    if (user.status !== "APPROVED") {
      throw new AppError(
        "Account is not approved",
        403,
        "ACCOUNT_NOT_APPROVED",
      );
    }

    await userRepository.updateLastLoginAt(user.id);

    const accessToken = signAccessToken(user.id);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
      },
    };
  }

  async verifyEmail(token: string) {
    if (!token || token.trim().length === 0) {
      throw new AppError(
        "Verification token is required",
        400,
        "VERIFICATION_TOKEN_REQUIRED",
      );
    }

    const tokenHash = hashEmailVerificationToken(token);

    const verificationToken =
      await emailVerificationTokenRepository.findValidToken(tokenHash);

    if (!verificationToken) {
      throw new AppError(
        "Invalid or expired verification token",
        400,
        "INVALID_VERIFICATION_TOKEN",
      );
    }

    if (verificationToken.user.status !== "EMAIL_UNVERIFIED") {
      throw new AppError(
        "Email is already verified",
        409,
        "EMAIL_ALREADY_VERIFIED",
      );
    }

    const user = await emailVerificationTokenRepository.verifyUserEmail(
      verificationToken.userId,
      verificationToken.id,
    );

    return {
      id: user.id,
      email: user.email,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
    };
  }

  async resendVerification(email: string) {
    const validatedData = registerSchema
      .pick({
        email: true,
      })
      .parse({
        email,
      });

    const user = await userRepository.findByEmail(validatedData.email);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    if (user.status !== "EMAIL_UNVERIFIED") {
      throw new AppError(
        "Email is already verified",
        409,
        "EMAIL_ALREADY_VERIFIED",
      );
    }

    await emailVerificationTokenRepository.invalidateUserTokens(user.id);

    const rawVerificationToken = generateEmailVerificationToken();

    const tokenHash = hashEmailVerificationToken(rawVerificationToken);

    const expiresAt = new Date(
      Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRY_MINUTES * 60 * 1000,
    );

    await emailVerificationTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return {
      email: user.email,
      verificationToken: rawVerificationToken,
      verificationTokenExpiresAt: expiresAt,
    };
  }

  async forgotPassword(email: string) {
    const validatedData = registerSchema
      .pick({
        email: true,
      })
      .parse({
        email,
      });

    const user = await userRepository.findByEmail(validatedData.email);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    if (user.status !== "APPROVED") {
      throw new AppError(
        "Account is not approved",
        403,
        "ACCOUNT_NOT_APPROVED",
      );
    }

    // Invalidate all previous unused reset tokens.
    await passwordResetTokenRepository.invalidateUserTokens(user.id);

    // Generate a new secure reset token.
    const rawResetToken = generatePasswordResetToken();

    // Store only the hash in the database.
    const tokenHash = hashPasswordResetToken(rawResetToken);

    // Token expires after 15 minutes.
    const expiresAt = new Date(
      Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000,
    );

    await passwordResetTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return {
      email: user.email,

      // Development testing only.
      // Later this token will be sent by email.
      resetToken: rawResetToken,
      resetTokenExpiresAt: expiresAt,
    };
  }

  async resetPassword(token: string, password: string) {
    const validatedData = resetPasswordSchema.parse({
      token,
      password,
    });

    const tokenHash = hashPasswordResetToken(validatedData.token);

    const resetToken =
      await passwordResetTokenRepository.findValidToken(tokenHash);

    if (!resetToken) {
      throw new AppError(
        "Invalid or expired password reset token",
        400,
        "INVALID_PASSWORD_RESET_TOKEN",
      );
    }

    if (resetToken.user.status !== "APPROVED") {
      throw new AppError(
        "Account is not approved",
        403,
        "ACCOUNT_NOT_APPROVED",
      );
    }

    const passwordHash = await bcrypt.hash(validatedData.password, SALT_ROUNDS);

    const user = await passwordResetTokenRepository.resetPassword(
      resetToken.userId,
      resetToken.id,
      passwordHash,
    );

    return {
      id: user.id,
      email: user.email,
      status: user.status,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return {
      id: user.id,
      email: user.email,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
