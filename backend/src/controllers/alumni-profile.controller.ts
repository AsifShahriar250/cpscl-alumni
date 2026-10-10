import type { Request, Response } from "express";

import { AppError } from "../errors/AppError.js";
import { alumniProfileService } from "../services/alumni-profile.service.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export async function getMyProfile(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  if (!req.userId) {
    throw new AppError(
      "Authentication required",
      401,
      "AUTHENTICATION_REQUIRED",
    );
  }

  const profile = await alumniProfileService.getMyProfile(
    req.userId,
  );

  res.status(200).json({
    success: true,
    data: profile,
  });
}

export async function createMyProfile(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  if (!req.userId) {
    throw new AppError(
      "Authentication required",
      401,
      "AUTHENTICATION_REQUIRED",
    );
  }

  const data = req.body;

  const profile = await alumniProfileService.createProfile(
    req.userId,
    {
      ...data,
      dateOfBirth: data.dateOfBirth
        ? new Date(data.dateOfBirth)
        : undefined,
    },
  );

  res.status(201).json({
    success: true,
    message: "Alumni profile created successfully",
    data: profile,
  });
}

export async function updateMyProfile(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  if (!req.userId) {
    throw new AppError(
      "Authentication required",
      401,
      "AUTHENTICATION_REQUIRED",
    );
  }

  const data = req.body;

  const profile = await alumniProfileService.updateMyProfile(
    req.userId,
    {
      ...data,
      dateOfBirth: data.dateOfBirth
        ? new Date(data.dateOfBirth)
        : undefined,
    },
  );

  res.status(200).json({
    success: true,
    message: "Alumni profile updated successfully",
    data: profile,
  });
}

export async function deleteMyProfile(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  if (!req.userId) {
    throw new AppError(
      "Authentication required",
      401,
      "AUTHENTICATION_REQUIRED",
    );
  }

  await alumniProfileService.deleteMyProfile(req.userId);

  res.status(200).json({
    success: true,
    message: "Alumni profile deleted successfully",
  });
}
