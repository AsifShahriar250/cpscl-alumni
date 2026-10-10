import type { Request, Response } from "express";

import { AppError } from "../errors/AppError.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { eventService } from "../services/event.service.js";
import {
  eventQuerySchema,
  publishEventSchema,
} from "../validators/event.validator.js";

function getEventId(req: Request): string {
  const { id } = req.params;

  if (typeof id !== "string" || id.length === 0) {
    throw new AppError("Event ID is required", 400, "EVENT_ID_REQUIRED");
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    throw new AppError("Invalid event ID", 400, "INVALID_EVENT_ID");
  }

  return id;
}

function getAuthenticatedUserId(req: AuthenticatedRequest): string {
  if (!req.userId) {
    throw new AppError(
      "Authentication required",
      401,
      "AUTHENTICATION_REQUIRED",
    );
  }

  return req.userId;
}

export async function getAllEvents(req: Request, res: Response): Promise<void> {
  const result = eventQuerySchema.safeParse(req.query);

  if (!result.success) {
    throw result.error;
  }

  const data = await eventService.getAllEvents(result.data);

  res.status(200).json({
    success: true,
    data: {
      events: data.events,
      pagination: {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      },
    },
  });
}

export async function getPublishedEvents(
  req: Request,
  res: Response,
): Promise<void> {
  const result = eventQuerySchema.safeParse(req.query);

  if (!result.success) {
    throw result.error;
  }

  const query = {
    ...result.data,
    status: "PUBLISHED" as const,
  };

  const data = await eventService.getAllEvents(query);

  res.status(200).json({
    success: true,
    data: {
      events: data.events,
      pagination: {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      },
    },
  });
}

export async function publishEvent(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  getAuthenticatedUserId(req);

  const eventId = getEventId(req);

  const result = publishEventSchema.safeParse(req.body);

  if (!result.success) {
    throw result.error;
  }

  const event = await eventService.publishEvent(eventId);

  res.status(200).json({
    success: true,
    message: "Event published successfully",
    data: event,
  });
}

export async function getEventById(req: Request, res: Response): Promise<void> {
  const eventId = getEventId(req);

  const event = await eventService.getEventById(eventId);

  res.status(200).json({
    success: true,
    data: event,
  });
}

export async function createEvent(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const organizerId = getAuthenticatedUserId(req);

  const event = await eventService.createEvent(organizerId, req.body);

  res.status(201).json({
    success: true,
    message: "Event created successfully",
    data: event,
  });
}

export async function updateEvent(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  getAuthenticatedUserId(req);

  const eventId = getEventId(req);

  const event = await eventService.updateEvent(eventId, req.body);

  res.status(200).json({
    success: true,
    message: "Event updated successfully",
    data: event,
  });
}

export async function deleteEvent(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  getAuthenticatedUserId(req);

  const eventId = getEventId(req);

  await eventService.deleteEvent(eventId);

  res.status(200).json({
    success: true,
    message: "Event deleted successfully",
  });
}
