import { Router } from "express";

import {
  forgotPassword,
  login,
  me,
  register,
  resendVerification,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.get("/verify-email", verifyEmail);

router.post("/resend-verification", resendVerification);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

router.get("/me", authenticate, me);

export default router;
