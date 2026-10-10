import { AppError } from "../errors/AppError.js";
import { batchRepository } from "../repositories/batch.repository.js";
import type {
  CreateBatchInput,
  UpdateBatchInput,
} from "../validators/batch.validator.js";

export class BatchService {
  async getAllBatches() {
    return batchRepository.findAll();
  }

  async getBatchById(id: string) {
    const batch = await batchRepository.findById(id);

    if (!batch) {
      throw new AppError("Batch not found", 404, "BATCH_NOT_FOUND");
    }

    return batch;
  }

  async createBatch(data: CreateBatchInput) {
    const existingBatch = await batchRepository.findByName(data.name);

    if (existingBatch) {
      throw new AppError("Batch already exists", 409, "BATCH_ALREADY_EXISTS");
    }

    return batchRepository.create({
      name: data.name,

      ...(data.description !== undefined && {
        description: data.description,
      }),

      ...(data.startYear !== undefined && {
        startYear: data.startYear,
      }),

      ...(data.endYear !== undefined && {
        endYear: data.endYear,
      }),

      ...(data.isActive !== undefined && {
        isActive: data.isActive,
      }),
    });
  }

  async updateBatch(id: string, data: UpdateBatchInput) {
    await this.getBatchById(id);

    if (data.name !== undefined) {
      const existingBatch = await batchRepository.findByName(data.name);

      if (existingBatch && existingBatch.id !== id) {
        throw new AppError("Batch already exists", 409, "BATCH_ALREADY_EXISTS");
      }
    }

    return batchRepository.update(id, {
      ...(data.name !== undefined && {
        name: data.name,
      }),

      ...(data.description !== undefined && {
        description: data.description,
      }),

      ...(data.startYear !== undefined && {
        startYear: data.startYear,
      }),

      ...(data.endYear !== undefined && {
        endYear: data.endYear,
      }),

      ...(data.isActive !== undefined && {
        isActive: data.isActive,
      }),
    });
  }

  async deleteBatch(id: string) {
    await this.getBatchById(id);

    return batchRepository.delete(id);
  }
}

export const batchService = new BatchService();
