import { prisma } from "../config/database.js";

export class MemoryRepository {
  async create(data: {
    authorId: string;
    title: string;
    content: string;
    imageUrl?: string;
  }) {
    return prisma.memory.create({
      data: {
        authorId: data.authorId,
        title: data.title,
        content: data.content,
        ...(data.imageUrl !== undefined && {
          imageUrl: data.imageUrl,
        }),
      },
    });
  }

  async findById(id: string) {
    return prisma.memory.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            alumniProfile: {
              select: {
                fullName: true,
                profilePhotoUrl: true,
                graduationYear: true,
              },
            },
          },
        },
      },
    });
  }

  async findMany(skip: number, take: number) {
    return prisma.memory.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            alumniProfile: {
              select: {
                fullName: true,
                profilePhotoUrl: true,
                graduationYear: true,
              },
            },
          },
        },
      },
    });
  }

  async count() {
    return prisma.memory.count();
  }

  async findByAuthor(authorId: string) {
    return prisma.memory.findMany({
      where: { authorId },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateByAuthor(
    id: string,
    authorId: string,
    data: {
      title?: string;
      content?: string;
      imageUrl?: string;
    },
  ) {
    const result = await prisma.memory.updateMany({
      where: { id, authorId },
      data,
    });

    if (result.count === 0) {
      return null;
    }

    return this.findById(id);
  }

  async deleteByAuthor(id: string, authorId: string) {
    const result = await prisma.memory.deleteMany({
      where: { id, authorId },
    });

    return result.count > 0;
  }
}

export const memoryRepository = new MemoryRepository();
