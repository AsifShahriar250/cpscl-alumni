import { z } from "zod";

export const eventRegistrationQuerySchema = z.object({
  status: z
    .enum(["REGISTERED", "CANCELLED", "ATTENDED"], {
      error: "Invalid registration status",
    })
    .optional(),

  page: z
    .coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),
});

export type EventRegistrationQuery = z.infer<
  typeof eventRegistrationQuerySchema
>;