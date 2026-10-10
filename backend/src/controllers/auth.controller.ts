import type { Request, Response } from "express";

import { AppError } from "../errors/AppError.js";
import { authService } from "../services/auth.service.js";

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await authService.register(email, password);

  res.status(201).json({
    success: true,
    message: "Registration successful",
    data: user,
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const token = req.query.token;

  if (typeof token !== "string" || token.length === 0) {
    throw new AppError(
      "Verification token is required",
      400,
      "VERIFICATION_TOKEN_REQUIRED",
    );
  }

  const user = await authService.verifyEmail(token);

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    data: user,
  });
}

export async function resendVerification(
  req: Request,
  res: Response,
): Promise<void> {
  const { email } = req.body;

  const result = await authService.resendVerification(email);

  res.status(200).json({
    success: true,
    message: "Verification email resent successfully",
    data: result,
  });
}

export async function forgotPassword(
  req: Request,
  res: Response,
): Promise<void> {
  const { email } = req.body;

  const result = await authService.forgotPassword(email);

  res.status(200).json({
    success: true,
    message: "Password reset token generated successfully",
    data: result,
  });
}

export async function resetPassword(
  req: Request,
  res: Response,
): Promise<void> {
  const { token, password } = req.body;

  const result = await authService.resetPassword(token, password);

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
    data: result,
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { userId?: string }).userId;

  if (!userId) {
    throw new AppError(
      "Authentication required",
      401,
      "AUTHENTICATION_REQUIRED",
    );
  }

  const user = await authService.getCurrentUser(userId);

  res.status(200).json({
    success: true,
    data: user,
  });
}
