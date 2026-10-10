import { prisma } from "../config/database.js";

export class BatchRepository {
  async findAll() {
    return prisma.batch.findMany({
      orderBy: [
        {
          name: "asc",
        },
        {
          id: "asc",
        },
      ],
    });
  }

  async findById(id: string) {
    return prisma.batch.findUnique({
      where: {
        id,
      },
    });
  }

  async findByName(name: string) {
    return prisma.batch.findUnique({
      where: {
        name,
      },
    });
  }

  async create(data: {
    name: string;
    description?: string;
    startYear?: number;
    endYear?: number;
    isActive?: boolean;
  }) {
    return prisma.batch.create({
      data,
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      startYear?: number;
      endYear?: number;
      isActive?: boolean;
    },
  ) {
    return prisma.batch.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string) {
    return prisma.batch.delete({
      where: {
        id,
      },
    });
  }
}

export const batchRepository =
  new BatchRepository();
