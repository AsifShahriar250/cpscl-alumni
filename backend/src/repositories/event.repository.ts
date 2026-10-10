import { prisma } from "../config/database.js";
import { Prisma } from "../generated/prisma/client.js";

import type { EventQuery } from "../validators/event.validator.js";

export class EventRepository {
  async findAll(query: EventQuery) {
    const { status, search, page, limit, isOnline } = query;
    const where = {
      ...(status !== undefined && {
        status,
      }),

      ...(isOnline !== undefined && {
        isOnline,
      }),

      ...(search !== undefined &&
        search.length > 0 && {
          OR: [
            {
              title: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              description: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              slug: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              category: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }),
    };

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          {
            startsAt: "asc",
          },
          {
            id: "asc",
          },
        ],
      }),

      prisma.event.count({
        where,
      }),
    ]);

    return {
      events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPublished() {
    return prisma.event.findMany({
      where: {
        status: "PUBLISHED",
      },
      orderBy: [
        {
          startsAt: "asc",
        },
        {
          id: "asc",
        },
      ],
    });
  }

  async findById(id: string) {
    return prisma.event.findUnique({
      where: {
        id,
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.event.findUnique({
      where: {
        slug,
      },
    });
  }

  async create(data: {
    title: string;
    slug: string;
    description: string;
    coverImageUrl?: string;
    category: string;
    startsAt: Date;
    endsAt: Date;
    venue?: string;
    location?: string;
    isOnline: boolean;
    onlineUrl?: string;
    capacity?: number;
    registrationDeadline?: Date;
    organizerId: string;
    status?: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  }) {
    return prisma.event.create({
      data,
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      slug?: string;
      description?: string;
      coverImageUrl?: string;
      category?: string;
      startsAt?: Date;
      endsAt?: Date;
      venue?: string;
      location?: string;
      isOnline?: boolean;
      onlineUrl?: string;
      capacity?: number;
      registrationDeadline?: Date;
      status?: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
    },
  ) {
    return prisma.event.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string) {
    return prisma.event.delete({
      where: {
        id,
      },
    });
  }
}

export const eventRepository = new EventRepository();
