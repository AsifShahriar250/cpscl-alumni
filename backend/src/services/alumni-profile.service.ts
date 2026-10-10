import { AppError } from "../errors/AppError.js";

import { alumniProfileRepository } from "../repositories/alumni-profile.repository.js";
import { batchRepository } from "../repositories/batch.repository.js";

export class AlumniProfileService {
  async getMyProfile(userId: string) {
    const profile =
      await alumniProfileRepository.findByUserId(userId);

    if (!profile) {
      throw new AppError(
        "Alumni profile not found",
        404,
        "ALUMNI_PROFILE_NOT_FOUND",
      );
    }

    return profile;
  }

  async createProfile(
    userId: string,
    data: {
      fullName: string;
      phone?: string;
      dateOfBirth?: Date;
      gender?: string;
      bio?: string;

      batchId: string;

      graduationYear: number;
      university: string;
      department: string;

      profession?: string;
      organization?: string;
      designation?: string;

      city?: string;
      country?: string;

      profilePhotoUrl?: string;

      linkedinUrl?: string;
      facebookUrl?: string;
      githubUrl?: string;
      websiteUrl?: string;

      isDirectoryVisible?: boolean;
    },
  ) {
    const existingProfile =
      await alumniProfileRepository.findByUserId(userId);

    if (existingProfile) {
      throw new AppError(
        "Alumni profile already exists",
        409,
        "ALUMNI_PROFILE_ALREADY_EXISTS",
      );
    }

    const batch =
      await batchRepository.findById(data.batchId);

    if (!batch) {
      throw new AppError(
        "Batch not found",
        404,
        "BATCH_NOT_FOUND",
      );
    }

    if (!batch.isActive) {
      throw new AppError(
        "Selected batch is inactive",
        400,
        "BATCH_INACTIVE",
      );
    }

    return alumniProfileRepository.create({
      userId,
      fullName: data.fullName,

      ...(data.phone !== undefined && {
        phone: data.phone,
      }),

      ...(data.dateOfBirth !== undefined && {
        dateOfBirth: data.dateOfBirth,
      }),

      ...(data.gender !== undefined && {
        gender: data.gender,
      }),

      ...(data.bio !== undefined && {
        bio: data.bio,
      }),

      batchId: batch.id,

      graduationYear: data.graduationYear,
      university: data.university,
      department: data.department,

      ...(data.profession !== undefined && {
        profession: data.profession,
      }),

      ...(data.organization !== undefined && {
        organization: data.organization,
      }),

      ...(data.designation !== undefined && {
        designation: data.designation,
      }),

      ...(data.city !== undefined && {
        city: data.city,
      }),

      ...(data.country !== undefined && {
        country: data.country,
      }),

      ...(data.profilePhotoUrl !== undefined && {
        profilePhotoUrl: data.profilePhotoUrl,
      }),

      ...(data.linkedinUrl !== undefined && {
        linkedinUrl: data.linkedinUrl,
      }),

      ...(data.facebookUrl !== undefined && {
        facebookUrl: data.facebookUrl,
      }),

      ...(data.githubUrl !== undefined && {
        githubUrl: data.githubUrl,
      }),

      ...(data.websiteUrl !== undefined && {
        websiteUrl: data.websiteUrl,
      }),

      ...(data.isDirectoryVisible !== undefined && {
        isDirectoryVisible:
          data.isDirectoryVisible,
      }),
    });
  }

  async updateMyProfile(
    userId: string,
    data: {
      fullName?: string;
      phone?: string;
      dateOfBirth?: Date;
      gender?: string;
      bio?: string;

      batchId?: string;

      graduationYear?: number;
      university?: string;
      department?: string;

      profession?: string;
      organization?: string;
      designation?: string;

      city?: string;
      country?: string;

      profilePhotoUrl?: string;

      linkedinUrl?: string;
      facebookUrl?: string;
      githubUrl?: string;
      websiteUrl?: string;

      isDirectoryVisible?: boolean;
    },
  ) {
    await this.getMyProfile(userId);

    let batchData: {
      batchId?: string;
    } = {};

    if (data.batchId !== undefined) {
      const batch =
        await batchRepository.findById(data.batchId);

      if (!batch) {
        throw new AppError(
          "Batch not found",
          404,
          "BATCH_NOT_FOUND",
        );
      }

      if (!batch.isActive) {
        throw new AppError(
          "Selected batch is inactive",
          400,
          "BATCH_INACTIVE",
        );
      }

      batchData = {
        batchId: batch.id,
      };
    }

    return alumniProfileRepository.update(userId, {
      ...(data.fullName !== undefined && {
        fullName: data.fullName,
      }),

      ...(data.phone !== undefined && {
        phone: data.phone,
      }),

      ...(data.dateOfBirth !== undefined && {
        dateOfBirth: data.dateOfBirth,
      }),

      ...(data.gender !== undefined && {
        gender: data.gender,
      }),

      ...(data.bio !== undefined && {
        bio: data.bio,
      }),

      ...batchData,

      ...(data.graduationYear !== undefined && {
        graduationYear: data.graduationYear,
      }),

      ...(data.university !== undefined && {
        university: data.university,
      }),

      ...(data.department !== undefined && {
        department: data.department,
      }),

      ...(data.profession !== undefined && {
        profession: data.profession,
      }),

      ...(data.organization !== undefined && {
        organization: data.organization,
      }),

      ...(data.designation !== undefined && {
        designation: data.designation,
      }),

      ...(data.city !== undefined && {
        city: data.city,
      }),

      ...(data.country !== undefined && {
        country: data.country,
      }),

      ...(data.profilePhotoUrl !== undefined && {
        profilePhotoUrl: data.profilePhotoUrl,
      }),

      ...(data.linkedinUrl !== undefined && {
        linkedinUrl: data.linkedinUrl,
      }),

      ...(data.facebookUrl !== undefined && {
        facebookUrl: data.facebookUrl,
      }),

      ...(data.githubUrl !== undefined && {
        githubUrl: data.githubUrl,
      }),

      ...(data.websiteUrl !== undefined && {
        websiteUrl: data.websiteUrl,
      }),

      ...(data.isDirectoryVisible !== undefined && {
        isDirectoryVisible:
          data.isDirectoryVisible,
      }),
    });
  }

  async deleteMyProfile(userId: string) {
    await this.getMyProfile(userId);

    return alumniProfileRepository.delete(userId);
  }
}

export const alumniProfileService =
  new AlumniProfileService();
