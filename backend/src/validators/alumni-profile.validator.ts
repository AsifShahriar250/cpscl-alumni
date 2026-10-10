import { z } from "zod";

const optionalString = (max: number) => z.string().trim().max(max).optional();

export const createAlumniProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(150, "Full name is too long"),

  phone: optionalString(30),

  dateOfBirth: z.string().datetime().optional(),

  gender: optionalString(30),

  bio: z.string().trim().max(2000, "Bio is too long").optional(),

  batchId: z.string().uuid("Invalid batch ID"),

  graduationYear: z
    .number()
    .int("Graduation year must be an integer")
    .min(1900, "Invalid graduation year")
    .max(2100, "Invalid graduation year"),

  university: z
    .string()
    .trim()
    .min(1, "University is required")
    .max(200, "University name is too long"),

  department: z
    .string()
    .trim()
    .min(1, "Department is required")
    .max(200, "Department name is too long"),

  profession: optionalString(150),

  organization: optionalString(200),

  designation: optionalString(150),

  city: optionalString(100),

  country: optionalString(100),

  profilePhotoUrl: z
    .string()
    .trim()
    .url("Invalid profile photo URL")
    .max(500)
    .optional(),

  linkedinUrl: z
    .string()
    .trim()
    .url("Invalid LinkedIn URL")
    .max(500)
    .optional(),

  facebookUrl: z
    .string()
    .trim()
    .url("Invalid Facebook URL")
    .max(500)
    .optional(),

  githubUrl: z.string().trim().url("Invalid GitHub URL").max(500).optional(),

  websiteUrl: z.string().trim().url("Invalid website URL").max(500).optional(),

  isDirectoryVisible: z.boolean().optional(),
});

export const updateAlumniProfileSchema = createAlumniProfileSchema.partial();

export type CreateAlumniProfileInput = z.infer<
  typeof createAlumniProfileSchema
>;

export type UpdateAlumniProfileInput = z.infer<
  typeof updateAlumniProfileSchema
>;
