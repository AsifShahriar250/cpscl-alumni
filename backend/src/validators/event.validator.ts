import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Event fields
|--------------------------------------------------------------------------
| Keep this as a plain Zod object.
| Refinements are added later so .omit() works with Zod v4.
|--------------------------------------------------------------------------
*/

const eventFields = {
  title: z
    .string()
    .trim()
    .min(3, "Event title must be at least 3 characters")
    .max(200, "Event title must not exceed 200 characters"),

  slug: z
    .string()
    .trim()
    .min(3, "Event slug must be at least 3 characters")
    .max(250, "Event slug must not exceed 250 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Event slug must contain only lowercase letters, numbers and hyphens",
    ),

  description: z
    .string()
    .trim()
    .min(10, "Event description must be at least 10 characters")
    .max(5000, "Event description must not exceed 5000 characters"),

  startsAt: z.coerce.date({
    error: "Invalid event start date",
  }),

  endsAt: z.coerce.date({
    error: "Invalid event end date",
  }),

  registrationDeadline: z.coerce
    .date({
      error: "Invalid registration deadline",
    })
    .optional(),

  location: z
    .string()
    .trim()
    .max(300, "Location must not exceed 300 characters")
    .optional(),

  venue: z
    .string()
    .trim()
    .max(200, "Venue must not exceed 200 characters")
    .optional(),

  isOnline: z.boolean().default(false),

  onlineUrl: z.string().trim().url("Online URL must be a valid URL").optional(),

  coverImageUrl: z
    .string()
    .trim()
    .url("Cover image URL must be a valid URL")
    .optional(),

  category: z
    .string()
    .trim()
    .min(2, "Category must be at least 2 characters")
    .max(100, "Category must not exceed 100 characters"),

  capacity: z
    .number()
    .int("Capacity must be an integer")
    .positive("Capacity must be greater than 0")
    .optional(),

  status: z
    .enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"], {
      error: "Invalid event status",
    })
    .default("DRAFT"),
};

/*
|--------------------------------------------------------------------------
| Create Event validation
|--------------------------------------------------------------------------
*/

export const createEventSchema = z
  .object(eventFields)
  .superRefine((data, ctx) => {
    /*
    |----------------------------------------------------------------------
    | Start / End
    |----------------------------------------------------------------------
    */

    if (data.endsAt <= data.startsAt) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "Event end time must be after start time",
      });
    }

    /*
    |----------------------------------------------------------------------
    | Registration deadline
    |----------------------------------------------------------------------
    */

    if (
      data.registrationDeadline !== undefined &&
      data.registrationDeadline >= data.startsAt
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["registrationDeadline"],
        message: "Registration deadline must be before event start",
      });
    }

    /*
    |----------------------------------------------------------------------
    | Online event
    |----------------------------------------------------------------------
    */

    if (data.isOnline === true && data.onlineUrl === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["onlineUrl"],
        message: "Online URL is required for online events",
      });
    }
  });

/*
|--------------------------------------------------------------------------
| Update Event
|--------------------------------------------------------------------------
|
| IMPORTANT:
| .omit() MUST happen before .superRefine()
| because Zod v4 does not allow .omit() on a refined object.
|--------------------------------------------------------------------------
*/

const updateEventObjectSchema = z
  .object(eventFields)
  .omit({
    status: true,
  })
  .partial();

export const updateEventSchema = updateEventObjectSchema.superRefine(
  (data, ctx) => {
    /*
    |----------------------------------------------------------------------
    | Start / End
    |----------------------------------------------------------------------
    |
    | Both are checked only when both values are supplied.
    |
    */

    if (data.startsAt !== undefined && data.endsAt !== undefined) {
      if (data.endsAt <= data.startsAt) {
        ctx.addIssue({
          code: "custom",
          path: ["endsAt"],
          message: "Event end time must be after start time",
        });
      }
    }

    /*
    |----------------------------------------------------------------------
    | Registration deadline
    |----------------------------------------------------------------------
    |
    | Only validate when both values are available.
    |
    */

    if (
      data.registrationDeadline !== undefined &&
      data.startsAt !== undefined
    ) {
      if (data.registrationDeadline >= data.startsAt) {
        ctx.addIssue({
          code: "custom",
          path: ["registrationDeadline"],
          message: "Registration deadline must be before event start",
        });
      }
    }

    /*
    |----------------------------------------------------------------------
    | Online event
    |----------------------------------------------------------------------
    |
    | If isOnline is explicitly changed to true,
    | onlineUrl must also be provided.
    |
    */

    if (data.isOnline === true && data.onlineUrl === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["onlineUrl"],
        message: "Online URL is required for online events",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| Event ID params
|--------------------------------------------------------------------------
*/

export const eventIdParamSchema = z.object({
  id: z.string().uuid("Invalid event ID"),
});

/*
|--------------------------------------------------------------------------
| Event query
|--------------------------------------------------------------------------
*/

export const eventQuerySchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).optional(),

  search: z.string().trim().max(200).optional(),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  isOnline: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

export const publishEventSchema = z.object({
  status: z.literal("PUBLISHED"),
});

/*
|--------------------------------------------------------------------------
| TypeScript types
|--------------------------------------------------------------------------
*/

export type CreateEventInput = z.infer<typeof createEventSchema>;

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export type EventIdParam = z.infer<typeof eventIdParamSchema>;

export type EventQuery = z.infer<typeof eventQuerySchema>;
