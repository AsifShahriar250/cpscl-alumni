import type { Request, Response } from "express";

import { adminService } from "../services/admin.service.js";

export async function getPendingVerificationUsers(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const users = await adminService.getPendingVerificationUsers();

    res.status(200).json({
      success: true,
      data: {
        users,
        count: users.length,
      },
    });
  } catch (error) {
    console.error("Get pending verification users error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function approveUser(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string" || id.length === 0) {
    res.status(400).json({
      success: false,
      message: "Valid user ID is required",
    });
    return;
  }

  try {
    const user = await adminService.approveUser(id);

    res.status(200).json({
      success: true,
      message: "User approved successfully",
      data: user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "User not found") {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (
      error instanceof Error &&
      error.message === "Only pending verification users can be approved"
    ) {
      res.status(409).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Approve user error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
