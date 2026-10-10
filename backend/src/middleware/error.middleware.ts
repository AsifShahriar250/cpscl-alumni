import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { AppError } from "../errors/AppError.js";

export const globalErrorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
): void => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      errors: error.issues,
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
    });
    return;
  }

  console.error("Unhandled error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
  });
};
