import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const authorization = req.headers.authorization;

  if (!authorization) {
    next(
      new AppError("Authentication required", 401, "AUTHENTICATION_REQUIRED"),
    );
    return;
  }

  const parts = authorization.trim().split(/\s+/);

  if (parts.length !== 2) {
    next(
      new AppError(
        "Invalid authorization header",
        401,
        "INVALID_AUTHORIZATION_HEADER",
      ),
    );
    return;
  }

  const [scheme, token] = parts;

  if (scheme !== "Bearer" || !token) {
    next(
      new AppError(
        "Invalid authorization header",
        401,
        "INVALID_AUTHORIZATION_HEADER",
      ),
    );
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    req.userId = payload.userId;

    next();
  } catch {
    next(
      new AppError(
        "Invalid or expired access token",
        401,
        "INVALID_ACCESS_TOKEN",
      ),
    );
  }
}
