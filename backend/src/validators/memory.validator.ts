import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Memory fields
|--------------------------------------------------------------------------
*/

const memoryFields = {
  title: z
    .string()
    .trim()
    .min(3, "Memory title must be at least 3 characters")
    .max(200, "Memory title must not exceed 200 characters"),

  content: z
    .string()
    .trim()
    .min(10, "Memory content must be at least 10 characters")
    .max(10000, "Memory content must not exceed 10000 characters"),

  imageUrl: z
    .string()
    .trim()
    .url("Image URL must be a valid URL")
    .max(500, "Image URL must not exceed 500 characters")
    .optional(),
};

/*
|--------------------------------------------------------------------------
| Create Memory
|--------------------------------------------------------------------------
*/

export const createMemorySchema = z.object(memoryFields);

/*
|--------------------------------------------------------------------------
| Update Memory
|--------------------------------------------------------------------------
*/

export const updateMemorySchema = z
  .object(memoryFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

/*
|--------------------------------------------------------------------------
| Memory Query
|--------------------------------------------------------------------------
*/

export const memoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),
});

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

export type CreateMemoryInput = z.infer<typeof createMemorySchema>;

export type UpdateMemoryInput = z.infer<typeof updateMemorySchema>;

export type MemoryQuery = z.infer<typeof memoryQuerySchema>;
