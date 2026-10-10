import type { Request, Response } from "express";

import { AppError } from "../errors/AppError.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { memoryService } from "../services/memory.service.js";

import {
  createMemorySchema,
  memoryQuerySchema,
  updateMemorySchema,
} from "../validators/memory.validator.js";

function getMemoryId(req: Request): string {
  const { id } = req.params;

  if (typeof id !== "string" || id.length === 0) {
    throw new AppError(
      "Memory ID is required",
      400,
      "MEMORY_ID_REQUIRED",
    );
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    throw new AppError(
      "Invalid memory ID",
      400,
      "INVALID_MEMORY_ID",
    );
  }

  return id;
}

function getAuthenticatedUserId(
  req: AuthenticatedRequest,
): string {
  if (!req.userId) {
    throw new AppError(
      "Authentication required",
      401,
      "AUTHENTICATION_REQUIRED",
    );
  }

  return req.userId;
}

export async function getAllMemories(
  req: Request,
  res: Response,
): Promise<void> {
  const result = memoryQuerySchema.safeParse(req.query);

  if (!result.success) {
    throw result.error;
  }

  const data = await memoryService.getAllMemories(result.data);

  res.status(200).json({
    success: true,
    data,
  });
}

export async function getMemoryById(
  req: Request,
  res: Response,
): Promise<void> {
  const memoryId = getMemoryId(req);
  const memory = await memoryService.getMemoryById(memoryId);

  res.status(200).json({
    success: true,
    data: memory,
  });
}

export async function getMyMemories(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const authorId = getAuthenticatedUserId(req);
  const memories = await memoryService.getMyMemories(authorId);

  res.status(200).json({
    success: true,
    data: memories,
  });
}

export async function createMemory(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const authorId = getAuthenticatedUserId(req);

  const result = createMemorySchema.safeParse(req.body);

  if (!result.success) {
    throw result.error;
  }

  const memory = await memoryService.createMemory(
    authorId,
    result.data,
  );

  res.status(201).json({
    success: true,
    message: "Memory created successfully",
    data: memory,
  });
}

export async function updateMyMemory(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const authorId = getAuthenticatedUserId(req);
  const memoryId = getMemoryId(req);

  const result = updateMemorySchema.safeParse(req.body);

  if (!result.success) {
    throw result.error;
  }

  const memory = await memoryService.updateMyMemory(
    authorId,
    memoryId,
    result.data,
  );

  res.status(200).json({
    success: true,
    message: "Memory updated successfully",
    data: memory,
  });
}

export async function deleteMyMemory(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const authorId = getAuthenticatedUserId(req);
  const memoryId = getMemoryId(req);

  const result = await memoryService.deleteMyMemory(
    authorId,
    memoryId,
  );

  res.status(200).json({
    success: true,
    ...result,
  });
}
