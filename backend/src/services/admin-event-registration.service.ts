import { AppError } from "../errors/AppError.js";
import { eventRegistrationRepository } from "../repositories/event-registration.repository.js";
import { eventRepository } from "../repositories/event.repository.js";
import type { EventRegistrationQuery } from "../validators/event-registration.validator.js";

export class AdminEventRegistrationService {
  /*
  |--------------------------------------------------------------------------
  | Get Event Registrations
  |--------------------------------------------------------------------------
  */

  async getEventRegistrations(
    eventId: string,
    query: EventRegistrationQuery,
  ) {
    const event = await eventRepository.findById(eventId);

    if (!event) {
      throw new AppError(
        "Event not found",
        404,
        "EVENT_NOT_FOUND",
      );
    }

    const result =
      await eventRegistrationRepository.findByEvent(
        eventId,
        query,
      );

    return {
      event,
      ...result,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Get Registration Statistics
  |--------------------------------------------------------------------------
  */

  async getEventRegistrationStats(
    eventId: string,
  ) {
    const event = await eventRepository.findById(eventId);

    if (!event) {
      throw new AppError(
        "Event not found",
        404,
        "EVENT_NOT_FOUND",
      );
    }

    const groupedStats =
      await eventRegistrationRepository.getStatsByEvent(
        eventId,
      );

    let registered = 0;
    let cancelled = 0;
    let attended = 0;

    for (const item of groupedStats) {
      switch (item.status) {
        case "REGISTERED":
          registered = item._count._all;
          break;

        case "CANCELLED":
          cancelled = item._count._all;
          break;

        case "ATTENDED":
          attended = item._count._all;
          break;
      }
    }

    const total =
      registered +
      cancelled +
      attended;

    const activeRegistrations =
      registered +
      attended;

    const remainingSeats =
      event.capacity === null
        ? null
        : Math.max(
            event.capacity -
              activeRegistrations,
            0,
          );

    const isFull =
      event.capacity !== null &&
      activeRegistrations >= event.capacity;

    return {
      eventId,
      capacity: event.capacity,
      total,
      registered,
      cancelled,
      attended,
      activeRegistrations,
      remainingSeats,
      isFull,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Mark Registration as Attended
  |--------------------------------------------------------------------------
  */

  async markAsAttended(
    registrationId: string,
  ) {
    const registration =
      await eventRegistrationRepository.findById(
        registrationId,
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
        "Cancelled registration cannot be marked as attended",
        400,
        "CANCELLED_REGISTRATION_CANNOT_BE_ATTENDED",
      );
    }

    if (registration.status === "ATTENDED") {
      throw new AppError(
        "Registration is already marked as attended",
        400,
        "REGISTRATION_ALREADY_ATTENDED",
      );
    }

    return eventRegistrationRepository.updateStatus(
      registrationId,
      "ATTENDED",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Cancel Registration by Admin
  |--------------------------------------------------------------------------
  */

  async cancelRegistration(
    registrationId: string,
  ) {
    const registration =
      await eventRegistrationRepository.findById(
        registrationId,
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
      registrationId,
      "CANCELLED",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Delete Cancelled Registration
  |--------------------------------------------------------------------------
  |
  | Only CANCELLED registrations can be permanently deleted.
  | REGISTERED and ATTENDED registrations are preserved.
  |
  */

  async deleteRegistration(
    registrationId: string,
  ) {
    const registration =
      await eventRegistrationRepository.findById(
        registrationId,
      );

    if (!registration) {
      throw new AppError(
        "Registration not found",
        404,
        "REGISTRATION_NOT_FOUND",
      );
    }

    if (registration.status === "REGISTERED") {
      throw new AppError(
        "Active registration cannot be deleted",
        400,
        "ACTIVE_REGISTRATION_CANNOT_BE_DELETED",
      );
    }

    if (registration.status === "ATTENDED") {
      throw new AppError(
        "Attended registration cannot be deleted",
        400,
        "ATTENDED_REGISTRATION_CANNOT_BE_DELETED",
      );
    }

    return eventRegistrationRepository.delete(
      registrationId,
    );
  }
}

export const adminEventRegistrationService =
  new AdminEventRegistrationService();