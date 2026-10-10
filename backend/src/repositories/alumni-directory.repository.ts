import { prisma } from "../config/database.js";

export interface AlumniDirectoryFilters {
  search?: string;
  batchId?: string;
  graduationYear?: number;
  profession?: string;
  organization?: string;
  city?: string;
  country?: string;
  university?: string;
  department?: string;

  skip: number;
  take: number;

  sortBy:
    | "fullName"
    | "graduationYear"
    | "batch"
    | "createdAt";

  sortOrder: "asc" | "desc";
}

export class AlumniDirectoryRepository {
  async findPublicProfiles(
    filters: AlumniDirectoryFilters,
  ) {
    const {
      search,
      batchId,
      graduationYear,
      profession,
      organization,
      city,
      country,
      university,
      department,
      skip,
      take,
      sortBy,
      sortOrder,
    } = filters;

    const where = {
      isDirectoryVisible: true,

      user: {
        status: "APPROVED" as const,
      },

      ...(batchId !== undefined && {
        batchId,
      }),

      ...(graduationYear !== undefined && {
        graduationYear,
      }),

      ...(profession && {
        profession: {
          contains: profession,
          mode: "insensitive" as const,
        },
      }),

      ...(organization && {
        organization: {
          contains: organization,
          mode: "insensitive" as const,
        },
      }),

      ...(city && {
        city: {
          contains: city,
          mode: "insensitive" as const,
        },
      }),

      ...(country && {
        country: {
          contains: country,
          mode: "insensitive" as const,
        },
      }),

      ...(university && {
        university: {
          contains: university,
          mode: "insensitive" as const,
        },
      }),

      ...(department && {
        department: {
          contains: department,
          mode: "insensitive" as const,
        },
      }),

      ...(search && {
        OR: [
          {
            fullName: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            profession: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            organization: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            city: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    };

    let orderBy:
      | {
          fullName: "asc" | "desc";
        }
      | {
          graduationYear: "asc" | "desc";
        }
      | {
          batchRecord: {
            name: "asc" | "desc";
          };
        }
      | {
          createdAt: "asc" | "desc";
        };

    switch (sortBy) {
      case "graduationYear":
        orderBy = {
          graduationYear: sortOrder,
        };
        break;

      case "batch":
        orderBy = {
          batchRecord: {
            name: sortOrder,
          },
        };
        break;

      case "createdAt":
        orderBy = {
          createdAt: sortOrder,
        };
        break;

      case "fullName":
      default:
        orderBy = {
          fullName: sortOrder,
        };
        break;
    }

    const [profiles, total] = await prisma.$transaction([
      prisma.alumniProfile.findMany({
        where,

        select: {
          id: true,
          fullName: true,
          bio: true,
          batchId: true,
          graduationYear: true,
          university: true,
          department: true,
          profession: true,
          organization: true,
          designation: true,
          city: true,
          country: true,
          profilePhotoUrl: true,
          linkedinUrl: true,
          facebookUrl: true,
          githubUrl: true,
          websiteUrl: true,

          batchRecord: {
            select: {
              id: true,
              name: true,
              isActive: true,
            },
          },
        },

        orderBy: [
          orderBy,
          {
            id: "asc",
          },
        ],

        skip,
        take,
      }),

      prisma.alumniProfile.count({
        where,
      }),
    ]);

    return {
      profiles,
      total,
    };
  }
}

export const alumniDirectoryRepository =
  new AlumniDirectoryRepository();
