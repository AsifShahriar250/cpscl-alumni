import { AppError } from "../errors/AppError.js";
import { eventRegistrationRepository } from "../repositories/event-registration.repository.js";
import { eventRepository } from "../repositories/event.repository.js";
import { userRepository } from "../repositories/user.repository.js";

export class EventRegistrationService {
  /*
  |--------------------------------------------------------------------------
  | Register for Event
  |--------------------------------------------------------------------------
  */

  async registerForEvent(eventId: string, userId: string) {
    // 1. Check user
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // 2. Check event
    const event = await eventRepository.findById(eventId);

    if (!event) {
      throw new AppError("Event not found", 404, "EVENT_NOT_FOUND");
    }

    // 3. Only published events can accept registration
    if (event.status !== "PUBLISHED") {
      throw new AppError(
        "Registration is available only for published events",
        400,
        "EVENT_NOT_OPEN_FOR_REGISTRATION",
      );
    }

    // 4. Event must not have ended
    const now = new Date();

    if (event.endsAt <= now) {
      throw new AppError(
        "Registration is closed because the event has ended",
        400,
        "EVENT_ALREADY_ENDED",
      );
    }

    // 5. Check registration deadline
    if (
      event.registrationDeadline !== null &&
      event.registrationDeadline <= now
    ) {
      throw new AppError(
        "Registration deadline has passed",
        400,
        "REGISTRATION_DEADLINE_PASSED",
      );
    }

    // 6. Register atomically, including capacity validation
    try {
      return await eventRegistrationRepository.registerAtomically(
        eventId,
        userId,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "EVENT_NOT_FOUND") {
          throw new AppError("Event not found", 404, "EVENT_NOT_FOUND");
        }

        if (error.message === "EVENT_NOT_OPEN_FOR_REGISTRATION") {
          throw new AppError(
            "Registration is available only for published events",
            400,
            "EVENT_NOT_OPEN_FOR_REGISTRATION",
          );
        }

        if (error.message === "EVENT_ALREADY_ENDED") {
          throw new AppError(
            "Registration is closed because the event has ended",
            400,
            "EVENT_ALREADY_ENDED",
          );
        }

        if (error.message === "REGISTRATION_DEADLINE_PASSED") {
          throw new AppError(
            "Registration deadline has passed",
            400,
            "REGISTRATION_DEADLINE_PASSED",
          );
        }

        if (error.message === "ALREADY_REGISTERED") {
          throw new AppError(
            "You are already registered for this event",
            409,
            "ALREADY_REGISTERED",
          );
        }

        if (error.message === "EVENT_FULL") {
          throw new AppError(
            "Event registration is full",
            409,
            "EVENT_CAPACITY_REACHED",
          );
        }
      }

      throw error;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Get Current User Registration
  |--------------------------------------------------------------------------
  */

  async getMyRegistration(eventId: string, userId: string) {
    const event = await eventRepository.findById(eventId);

    if (!event) {
      throw new AppError("Event not found", 404, "EVENT_NOT_FOUND");
    }

    return eventRegistrationRepository.findByEventAndUser(eventId, userId);
  }

  /*
  |--------------------------------------------------------------------------
  | Cancel Registration
  |--------------------------------------------------------------------------
  */

  async cancelRegistration(eventId: string, userId: string) {
    const registration = await eventRegistrationRepository.findByEventAndUser(
      eventId,
      userId,
    );

    if (!registration) {
      throw new AppError(
        "Registration not found",
        404,
        "REGISTRATION_NOT_FOUND",
      );
    }

    if (registration.status === "CANCELLED") {
      throw new AppError(
        "Registration is already cancelled",
        400,
        "REGISTRATION_ALREADY_CANCELLED",
      );
    }

    if (registration.status === "ATTENDED") {
      throw new AppError(
        "Attended registration cannot be cancelled",
        400,
        "ATTENDED_REGISTRATION_CANNOT_BE_CANCELLED",
      );
    }

    return eventRegistrationRepository.updateStatus(
      registration.id,
      "CANCELLED",
    );
  }
}

export const eventRegistrationService = new EventRegistrationService();
