import type { Request, Response } from "express";

import { AppError } from "../errors/AppError.js";
import { batchService } from "../services/batch.service.js";

function getBatchId(req: Request): string {
  const { id } = req.params;

  if (typeof id !== "string" || id.length === 0) {
    throw new AppError(
      "Batch ID is required",
      400,
      "BATCH_ID_REQUIRED",
    );
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    throw new AppError(
      "Invalid batch ID",
      400,
      "INVALID_BATCH_ID",
    );
  }

  return id;
}
export async function getAllBatches(
  _req: Request,
  res: Response,
): Promise<void> {
  const batches = await batchService.getAllBatches();

  res.status(200).json({
    success: true,
    data: {
      batches,
      count: batches.length,
    },
  });
}

export async function getBatchById(req: Request, res: Response): Promise<void> {
  const batchId = getBatchId(req);

  const batch = await batchService.getBatchById(batchId);

  res.status(200).json({
    success: true,
    data: batch,
  });
}

export async function createBatch(req: Request, res: Response): Promise<void> {
  const batch = await batchService.createBatch(req.body);

  res.status(201).json({
    success: true,
    message: "Batch created successfully",
    data: batch,
  });
}

export async function updateBatch(req: Request, res: Response): Promise<void> {
  const batchId = getBatchId(req);

  const batch = await batchService.updateBatch(batchId, req.body);

  res.status(200).json({
    success: true,
    message: "Batch updated successfully",
    data: batch,
  });
}

export async function deleteBatch(req: Request, res: Response): Promise<void> {
  const batchId = getBatchId(req);

  await batchService.deleteBatch(batchId);

  res.status(200).json({
    success: true,
    message: "Batch deleted successfully",
  });
}
