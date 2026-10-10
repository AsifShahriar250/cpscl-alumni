import type { NextFunction, Response } from "express";

import { RoleName } from "../generated/prisma/client.js";

import { AppError } from "../errors/AppError.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";

import { roleRepository } from "../repositories/role.repository.js";

export function requireRole(...allowedRoles: RoleName[]) {
  return async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.userId) {
      next(
        new AppError("Authentication required", 401, "AUTHENTICATION_REQUIRED"),
      );
      return;
    }

    if (allowedRoles.length === 0) {
      next(
        new AppError(
          "Role authorization configuration error",
          500,
          "ROLE_AUTHORIZATION_CONFIG_ERROR",
        ),
      );
      return;
    }

    try {
      const userRoles = await roleRepository.findByUserId(req.userId);

      const hasAllowedRole = userRoles.some((userRole) =>
        allowedRoles.includes(userRole.role.name),
      );

      if (!hasAllowedRole) {
        next(new AppError("Forbidden", 403, "FORBIDDEN"));
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
