import { Router } from "express";

import {
  createBatch,
  deleteBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
} from "../controllers/batch.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

import {
  createBatchSchema,
  updateBatchSchema,
} from "../validators/batch.validator.js";

const router = Router();

/*
 * Public routes
 * Anyone can view batches.
 */

router.get("/", getAllBatches);

router.get("/:id", getBatchById);

/*
 * Admin routes
 * Only ADMIN and SUPER_ADMIN can create/update/delete.
 */

router.post(
  "/",
  authenticate,
  requireRole("ADMIN", "SUPER_ADMIN"),
  (req, _res, next) => {
    const result = createBatchSchema.safeParse(req.body);

    if (!result.success) {
      next(result.error);
      return;
    }

    req.body = result.data;
    next();
  },
  createBatch,
);

router.patch(
  "/:id",
  authenticate,
  requireRole("ADMIN", "SUPER_ADMIN"),
  (req, _res, next) => {
    const result = updateBatchSchema.safeParse(req.body);

    if (!result.success) {
      next(result.error);
      return;
    }

    req.body = result.data;
    next();
  },
  updateBatch,
);

router.delete(
  "/:id",
  authenticate,
  requireRole("ADMIN", "SUPER_ADMIN"),
  deleteBatch,
);

export default router;
