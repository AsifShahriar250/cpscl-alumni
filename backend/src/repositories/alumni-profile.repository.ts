import { prisma } from "../config/database.js";

export class AlumniProfileRepository {
  async findByUserId(userId: string) {
    return prisma.alumniProfile.findUnique({
      where: {
        userId,
      },
      include: {
        batchRecord: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.alumniProfile.findUnique({
      where: {
        id,
      },
      include: {
        batchRecord: true,
      },
    });
  }

  async create(data: {
    userId: string;
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
  }) {
    return prisma.alumniProfile.create({
      data,
      include: {
        batchRecord: true,
      },
    });
  }

  async update(
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
    return prisma.alumniProfile.update({
      where: {
        userId,
      },
      data,
      include: {
        batchRecord: true,
      },
    });
  }

  async delete(userId: string) {
    return prisma.alumniProfile.delete({
      where: {
        userId,
      },
    });
  }
}

export const alumniProfileRepository =
  new AlumniProfileRepository();
