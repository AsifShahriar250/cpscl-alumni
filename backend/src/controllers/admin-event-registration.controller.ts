import type { Response } from "express";
import { AppError } from "../errors/AppError.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { adminEventRegistrationService } from "../services/admin-event-registration.service.js";
import { eventRegistrationQuerySchema } from "../validators/event-registration.validator.js";

function getParam(
  req: AuthenticatedRequest,
  name: string,
  fieldLabel: string,
): string {
  const value = req.params[name];

  if (typeof value !== "string" || value.length === 0) {
    throw new AppError(
      `${fieldLabel} is required`,
      400,
      `${name.toUpperCase()}_REQUIRED`,
    );
  }

  return value;
}

function validateUuid(
  value: string,
  errorMessage: string,
  errorCode: string,
): string {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(value)) {
    throw new AppError(errorMessage, 400, errorCode);
  }

  return value;
}

/*
|--------------------------------------------------------------------------
| Get Event Registrations
|--------------------------------------------------------------------------
*/

export async function getEventRegistrations(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const eventId = validateUuid(
    getParam(req, "eventId", "Event ID"),
    "Invalid event ID",
    "INVALID_EVENT_ID",
  );

  const queryResult = eventRegistrationQuerySchema.safeParse(req.query);

  if (!queryResult.success) {
    throw queryResult.error;
  }

  const result = await adminEventRegistrationService.getEventRegistrations(
    eventId,
    queryResult.data,
  );

  res.status(200).json({
    success: true,
    data: {
      event: result.event,
      registrations: result.registrations,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    },
  });
}

/*
|--------------------------------------------------------------------------
| Get Event Registration Statistics
|--------------------------------------------------------------------------
*/

export async function getEventRegistrationStats(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const eventId = validateUuid(
    getParam(req, "eventId", "Event ID"),
    "Invalid event ID",
    "INVALID_EVENT_ID",
  );

  const stats =
    await adminEventRegistrationService.getEventRegistrationStats(eventId);

  res.status(200).json({
    success: true,
    data: stats,
  });
}

/*
|--------------------------------------------------------------------------
| Mark Registration as Attended
|--------------------------------------------------------------------------
*/

export async function markRegistrationAttended(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const registrationId = validateUuid(
    getParam(req, "registrationId", "Registration ID"),
    "Invalid registration ID",
    "INVALID_REGISTRATION_ID",
  );

  const registration =
    await adminEventRegistrationService.markAsAttended(registrationId);

  res.status(200).json({
    success: true,
    message: "Registration marked as attended",
    data: registration,
  });
}

/*
|--------------------------------------------------------------------------
| Cancel Registration
|--------------------------------------------------------------------------
*/

export async function cancelRegistrationByAdmin(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const registrationId = validateUuid(
    getParam(req, "registrationId", "Registration ID"),
    "Invalid registration ID",
    "INVALID_REGISTRATION_ID",
  );

  const registration =
    await adminEventRegistrationService.cancelRegistration(registrationId);

  res.status(200).json({
    success: true,
    message: "Registration cancelled successfully",
    data: registration,
  });
}

/*
|--------------------------------------------------------------------------
| Delete Cancelled Registration
|--------------------------------------------------------------------------
*/

export async function deleteRegistration(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const registrationId = validateUuid(
    getParam(req, "registrationId", "Registration ID"),
    "Invalid registration ID",
    "INVALID_REGISTRATION_ID",
  );

  const registration =
    await adminEventRegistrationService.deleteRegistration(registrationId);

  res.status(200).json({
    success: true,
    message: "Registration deleted successfully",
    data: registration,
  });
}
