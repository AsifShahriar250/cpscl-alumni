import { AppError } from "../errors/AppError.js";
import { memoryRepository } from "../repositories/memory.repository.js";
import { userRepository } from "../repositories/user.repository.js";

import type {
  CreateMemoryInput,
  MemoryQuery,
  UpdateMemoryInput,
} from "../validators/memory.validator.js";

export class MemoryService {
  async getAllMemories(query: MemoryQuery) {
    const skip = (query.page - 1) * query.limit;

    const [memories, total] = await Promise.all([
      memoryRepository.findMany(skip, query.limit),
      memoryRepository.count(),
    ]);

    return {
      data: memories,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async getMemoryById(id: string) {
    const memory = await memoryRepository.findById(id);

    if (!memory) {
      throw new AppError(
        "Memory not found",
        404,
        "MEMORY_NOT_FOUND",
      );
    }

    return memory;
  }

  async getMyMemories(authorId: string) {
    return memoryRepository.findByAuthor(authorId);
  }

  async createMemory(authorId: string, data: CreateMemoryInput) {
    const author = await userRepository.findById(authorId);

    if (!author) {
      throw new AppError(
        "User not found",
        404,
        "USER_NOT_FOUND",
      );
    }

    return memoryRepository.create({
      authorId,
      title: data.title,
      content: data.content,
      ...(data.imageUrl !== undefined && {
        imageUrl: data.imageUrl,
      }),
    });
  }

  async updateMyMemory(
    authorId: string,
    id: string,
    data: UpdateMemoryInput,
  ) {
const memory = await memoryRepository.updateByAuthor(
  id,
  authorId,
  {
    ...(data.title !== undefined && {
      title: data.title,
    }),
    ...(data.content !== undefined && {
      content: data.content,
    }),
    ...(data.imageUrl !== undefined && {
      imageUrl: data.imageUrl,
    }),
  },
);

    if (!memory) {
      throw new AppError(
        "Memory not found or you do not have permission to update it",
        404,
        "MEMORY_NOT_FOUND",
      );
    }

    return memory;
  }

  async deleteMyMemory(authorId: string, id: string) {
    const deleted = await memoryRepository.deleteByAuthor(
      id,
      authorId,
    );

    if (!deleted) {
      throw new AppError(
        "Memory not found or you do not have permission to delete it",
        404,
        "MEMORY_NOT_FOUND",
      );
    }

    return {
      message: "Memory deleted successfully",
    };
  }
}

export const memoryService = new MemoryService();
