import { z } from "zod";

export const alumniDirectoryQuerySchema = z
  .object({
    search: z.string().trim().max(100, "Search text is too long").optional(),

    batchId: z.string().uuid("Invalid batch ID").optional(),

    graduationYear: z.coerce
      .number()
      .int("Graduation year must be an integer")
      .min(1900, "Invalid graduation year")
      .max(2100, "Invalid graduation year")
      .optional(),

    profession: z.string().trim().max(150, "Profession is too long").optional(),

    organization: z
      .string()
      .trim()
      .max(200, "Organization is too long")
      .optional(),

    city: z.string().trim().max(100, "City is too long").optional(),

    country: z.string().trim().max(100, "Country is too long").optional(),

    university: z.string().trim().max(200, "University is too long").optional(),

    department: z.string().trim().max(200, "Department is too long").optional(),

    page: z.coerce
      .number()
      .int("Page must be an integer")
      .min(1, "Page must be at least 1")
      .default(1),

    limit: z.coerce
      .number()
      .int("Limit must be an integer")
      .min(1, "Limit must be at least 1")
      .max(50, "Limit cannot exceed 50")
      .default(20),

    sortBy: z
      .enum(["fullName", "graduationYear", "batch", "createdAt"])
      .default("fullName"),

    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  })
  .strict();

export type AlumniDirectoryQuery = z.infer<typeof alumniDirectoryQuerySchema>;
