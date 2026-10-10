import { AppError } from "../errors/AppError.js";

import { eventRepository } from "../repositories/event.repository.js";
import { userRepository } from "../repositories/user.repository.js";

import type {
  CreateEventInput,
  EventQuery,
  UpdateEventInput,
} from "../validators/event.validator.js";

export class EventService {
  /*
  |--------------------------------------------------------------------------
  | Get All Events
  |--------------------------------------------------------------------------
  */

  async getAllEvents(query: EventQuery) {
    return eventRepository.findAll(query);
  }

  /*
  |--------------------------------------------------------------------------
  | Get Published Events
  |--------------------------------------------------------------------------
  */

  async getPublishedEvents() {
    return eventRepository.findPublished();
  }

  /*
  |--------------------------------------------------------------------------
  | Get Event By ID
  |--------------------------------------------------------------------------
  */

  async getEventById(id: string) {
    const event = await eventRepository.findById(id);

    if (!event) {
      throw new AppError("Event not found", 404, "EVENT_NOT_FOUND");
    }

    return event;
  }

  /*
  |--------------------------------------------------------------------------
  | Create Event
  |--------------------------------------------------------------------------
  */

  async createEvent(organizerId: string, data: CreateEventInput) {
    /*
     * Check organizer
     */

    const organizer = await userRepository.findById(organizerId);

    if (!organizer) {
      throw new AppError("Organizer not found", 404, "ORGANIZER_NOT_FOUND");
    }

    /*
     * Check duplicate slug
     */

    const existingSlug = await eventRepository.findBySlug(data.slug);

    if (existingSlug) {
      throw new AppError(
        "Event slug already exists",
        409,
        "EVENT_SLUG_ALREADY_EXISTS",
      );
    }

    /*
     * Convert dates
     */

    const startsAt = new Date(data.startsAt);
    const endsAt = new Date(data.endsAt);

    /*
     * Validate event time
     */

    if (endsAt <= startsAt) {
      throw new AppError(
        "End date/time must be after start date/time",
        400,
        "INVALID_EVENT_TIME_RANGE",
      );
    }

    /*
     * Registration deadline
     */

    let registrationDeadline: Date | undefined;

    if (data.registrationDeadline !== undefined) {
      registrationDeadline = new Date(data.registrationDeadline);

      if (registrationDeadline >= startsAt) {
        throw new AppError(
          "Registration deadline must be before event start",
          400,
          "INVALID_REGISTRATION_DEADLINE",
        );
      }
    }

    /*
     * Create event
     */

    return eventRepository.create({
      title: data.title,
      slug: data.slug,
      description: data.description,

      ...(data.coverImageUrl !== undefined && {
        coverImageUrl: data.coverImageUrl,
      }),

      category: data.category,

      startsAt,
      endsAt,

      ...(data.venue !== undefined && {
        venue: data.venue,
      }),

      ...(data.location !== undefined && {
        location: data.location,
      }),

      isOnline: data.isOnline,

      ...(data.onlineUrl !== undefined && {
        onlineUrl: data.onlineUrl,
      }),

      ...(data.capacity !== undefined && {
        capacity: data.capacity,
      }),

      ...(registrationDeadline !== undefined && {
        registrationDeadline,
      }),

      organizerId,

      status: data.status,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Update Event
  |--------------------------------------------------------------------------
  */

  async updateEvent(id: string, data: UpdateEventInput) {
    /*
     * Get existing event
     */

    const existingEvent = await this.getEventById(id);

    /*
     * Check duplicate slug
     */

    if (data.slug !== undefined) {
      const existingSlug = await eventRepository.findBySlug(data.slug);

      if (existingSlug && existingSlug.id !== existingEvent.id) {
        throw new AppError(
          "Event slug already exists",
          409,
          "EVENT_SLUG_ALREADY_EXISTS",
        );
      }
    }

    /*
     * Calculate effective dates
     *
     * If only one date is updated,
     * use the existing other date.
     */

    const startsAt =
      data.startsAt !== undefined
        ? new Date(data.startsAt)
        : existingEvent.startsAt;

    const endsAt =
      data.endsAt !== undefined ? new Date(data.endsAt) : existingEvent.endsAt;

    /*
     * Validate effective event time
     */

    if (endsAt <= startsAt) {
      throw new AppError(
        "End date/time must be after start date/time",
        400,
        "INVALID_EVENT_TIME_RANGE",
      );
    }

    /*
     * Registration deadline
     */

    let registrationDeadline: Date | undefined;

    if (data.registrationDeadline !== undefined) {
      registrationDeadline = new Date(data.registrationDeadline);

      if (registrationDeadline >= startsAt) {
        throw new AppError(
          "Registration deadline must be before event start",
          400,
          "INVALID_REGISTRATION_DEADLINE",
        );
      }
    }

    /*
     * Update event
     */

    return eventRepository.update(id, {
      ...(data.title !== undefined && {
        title: data.title,
      }),

      ...(data.slug !== undefined && {
        slug: data.slug,
      }),

      ...(data.description !== undefined && {
        description: data.description,
      }),

      ...(data.coverImageUrl !== undefined && {
        coverImageUrl: data.coverImageUrl,
      }),

      ...(data.category !== undefined && {
        category: data.category,
      }),

      ...(data.startsAt !== undefined && {
        startsAt,
      }),

      ...(data.endsAt !== undefined && {
        endsAt,
      }),

      ...(data.venue !== undefined && {
        venue: data.venue,
      }),

      ...(data.location !== undefined && {
        location: data.location,
      }),

      ...(data.isOnline !== undefined && {
        isOnline: data.isOnline,
      }),

      ...(data.onlineUrl !== undefined && {
        onlineUrl: data.onlineUrl,
      }),

      ...(data.capacity !== undefined && {
        capacity: data.capacity,
      }),

      ...(registrationDeadline !== undefined && {
        registrationDeadline,
      }),
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Publish Event
  |--------------------------------------------------------------------------
  */

  async publishEvent(id: string) {
    /*
     * Get existing event
     */

    const event = await this.getEventById(id);

    /*
     * Already published
     */

    if (event.status === "PUBLISHED") {
      throw new AppError(
        "Event is already published",
        400,
        "EVENT_ALREADY_PUBLISHED",
      );
    }

    /*
     * Cancelled event cannot be published
     */

    if (event.status === "CANCELLED") {
      throw new AppError(
        "Cancelled event cannot be published",
        400,
        "CANCELLED_EVENT_CANNOT_BE_PUBLISHED",
      );
    }

    /*
     * Completed event cannot be published
     */

    if (event.status === "COMPLETED") {
      throw new AppError(
        "Completed event cannot be published",
        400,
        "COMPLETED_EVENT_CANNOT_BE_PUBLISHED",
      );
    }

    /*
     * Publish event
     */

    return eventRepository.update(id, {
      status: "PUBLISHED",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Delete Event
  |--------------------------------------------------------------------------
  */

  async deleteEvent(id: string) {
    /*
     * Make sure event exists
     */

    await this.getEventById(id);

    /*
     * Delete event
     */

    return eventRepository.delete(id);
  }
}

export const eventService = new EventService();
