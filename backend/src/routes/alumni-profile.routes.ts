import { Router } from "express";

import {
  createMyProfile,
  deleteMyProfile,
  getMyProfile,
  updateMyProfile,
} from "../controllers/alumni-profile.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createAlumniProfileSchema,
  updateAlumniProfileSchema,
} from "../validators/alumni-profile.validator.js";

const router = Router();

router.use(authenticate);

router.get("/me", getMyProfile);

router.post("/me", (req, _res, next) => {
  const result = createAlumniProfileSchema.safeParse(req.body);

  if (!result.success) {
    next(result.error);
    return;
  }

  req.body = result.data;
  next();
}, createMyProfile);

router.patch("/me", (req, _res, next) => {
  const result = updateAlumniProfileSchema.safeParse(req.body);

  if (!result.success) {
    next(result.error);
    return;
  }

  req.body = result.data;
  next();
}, updateMyProfile);

router.delete("/me", deleteMyProfile);

export default router;
