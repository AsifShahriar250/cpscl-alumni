import { Router } from "express";

import {
  getAlumniDirectory,
} from "../controllers/alumni-directory.controller.js";

import {
  alumniDirectoryQuerySchema,
} from "../validators/alumni-directory.validator.js";

const router = Router();

router.get("/", (req, res, next) => {
  const result = alumniDirectoryQuerySchema.safeParse(req.query);

  if (!result.success) {
    next(result.error);
    return;
  }

  res.locals.alumniDirectoryQuery = result.data;

  next();
}, getAlumniDirectory);

export default router;
