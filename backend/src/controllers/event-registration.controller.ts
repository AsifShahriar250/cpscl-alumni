import type { Response } from "express";
import { AppError } from "../errors/AppError.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { eventRegistrationService } from "../services/event-registration.service.js";

function getAuthenticatedUserId(
  req: AuthenticatedRequest,
): string {
  if (!req.userId) {
    throw new AppError(
      "Authentication required",
      401,
      "AUTHENTICATION_REQUIRED",
    );
  }

  return req.userId;
}

function getEventId(
  req: AuthenticatedRequest,
): string {
  const { eventId } = req.params;

  if (
    typeof eventId !== "string" ||
    eventId.length === 0
  ) {
    throw new AppError(
      "Event ID is required",
      400,
      "EVENT_ID_REQUIRED",
    );
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(eventId)) {
    throw new AppError(
      "Invalid event ID",
      400,
      "INVALID_EVENT_ID",
    );
  }

  return eventId;
}

/*
|--------------------------------------------------------------------------
| Register for Event
|--------------------------------------------------------------------------
*/

export async function registerForEvent(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const userId = getAuthenticatedUserId(req);
  const eventId = getEventId(req);

  const registration =
    await eventRegistrationService.registerForEvent(
      eventId,
      userId,
    );

  res.status(201).json({
    success: true,
    message: "Event registration successful",
    data: registration,
  });
}

/*
|--------------------------------------------------------------------------
| Get My Registration
|--------------------------------------------------------------------------
*/

export async function getMyRegistration(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const userId = getAuthenticatedUserId(req);
  const eventId = getEventId(req);

  const registration =
    await eventRegistrationService.getMyRegistration(
      eventId,
      userId,
    );

  res.status(200).json({
    success: true,
    data: registration,
  });
}

/*
|--------------------------------------------------------------------------
| Cancel Registration
|--------------------------------------------------------------------------
*/

export async function cancelRegistration(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const userId = getAuthenticatedUserId(req);
  const eventId = getEventId(req);

  const registration =
    await eventRegistrationService.cancelRegistration(
      eventId,
      userId,
    );

  res.status(200).json({
    success: true,
    message: "Event registration cancelled successfully",
    data: registration,
  });
}