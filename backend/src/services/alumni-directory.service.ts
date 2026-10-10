import {
  alumniDirectoryRepository,
  type AlumniDirectoryFilters,
} from "../repositories/alumni-directory.repository.js";

import type {
  AlumniDirectoryQuery,
} from "../validators/alumni-directory.validator.js";

export class AlumniDirectoryService {
  async getDirectory(
    query: AlumniDirectoryQuery,
  ) {
    const skip =
      (query.page - 1) * query.limit;

    const take = query.limit;

    const filters: AlumniDirectoryFilters = {
      skip,
      take,

      sortBy: query.sortBy,
      sortOrder: query.sortOrder,

      ...(query.search !== undefined && {
        search: query.search,
      }),

      ...(query.batchId !== undefined && {
        batchId: query.batchId,
      }),

      ...(query.graduationYear !== undefined && {
        graduationYear: query.graduationYear,
      }),

      ...(query.profession !== undefined && {
        profession: query.profession,
      }),

      ...(query.organization !== undefined && {
        organization: query.organization,
      }),

      ...(query.city !== undefined && {
        city: query.city,
      }),

      ...(query.country !== undefined && {
        country: query.country,
      }),

      ...(query.university !== undefined && {
        university: query.university,
      }),

      ...(query.department !== undefined && {
        department: query.department,
      }),
    };

    const {
      profiles,
      total,
    } =
      await alumniDirectoryRepository.findPublicProfiles(
        filters,
      );

    const totalPages =
      total === 0
        ? 0
        : Math.ceil(
            total / query.limit,
          );

    return {
      profiles,

      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,

        hasNextPage:
          query.page < totalPages,

        hasPreviousPage:
          query.page > 1 && total > 0,
      },
    };
  }
}

export const alumniDirectoryService =
  new AlumniDirectoryService();
