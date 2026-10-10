import { Router } from "express";

import {
  approveUser,
  getPendingVerificationUsers,
} from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

router.get(
  "/test",
  authenticate,
  requireRole("ADMIN", "SUPER_ADMIN"),
  (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin access granted",
    });
  },
);

router.get(
  "/users/pending",
  authenticate,
  requireRole("ADMIN", "SUPER_ADMIN"),
  getPendingVerificationUsers,
);

router.patch(
  "/users/:id/approve",
  authenticate,
  requireRole("ADMIN", "SUPER_ADMIN"),
  approveUser,
);

export default router;
