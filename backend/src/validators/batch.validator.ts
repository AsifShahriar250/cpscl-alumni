import { z } from "zod";

const batchBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Batch name is required")
    .max(100, "Batch name is too long"),

  description: z
    .string()
    .trim()
    .max(2000, "Description is too long")
    .optional(),

  startYear: z
    .number()
    .int("Start year must be an integer")
    .min(1900, "Invalid start year")
    .max(2100, "Invalid start year")
    .optional(),

  endYear: z
    .number()
    .int("End year must be an integer")
    .min(1900, "Invalid end year")
    .max(2100, "Invalid end year")
    .optional(),

  isActive: z.boolean().optional(),
});

export const createBatchSchema = batchBaseSchema.refine(
  (data) =>
    data.startYear === undefined ||
    data.endYear === undefined ||
    data.endYear >= data.startYear,
  {
    message: "End year must be greater than or equal to start year",
    path: ["endYear"],
  },
);

export const updateBatchSchema = batchBaseSchema
  .partial()
  .refine(
    (data) =>
      data.startYear === undefined ||
      data.endYear === undefined ||
      data.endYear >= data.startYear,
    {
      message: "End year must be greater than or equal to start year",
      path: ["endYear"],
    },
  );

export type CreateBatchInput = z.infer<typeof createBatchSchema>;

export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;
