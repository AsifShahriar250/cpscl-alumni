import { Router } from "express";

import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  getPublishedEvents,
  publishEvent,
  updateEvent,
} from "../controllers/event.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

import {
  createEventSchema,
  updateEventSchema,
} from "../validators/event.validator.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Get all events
router.get("/", getAllEvents);

// Get only published events
router.get("/published", getPublishedEvents);

// Get single event
router.get("/:id", getEventById);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

// Create event
router.post(
  "/",
  authenticate,
  requireRole("ADMIN", "SUPER_ADMIN"),
  (req, _res, next) => {
    const result = createEventSchema.safeParse(req.body);

    if (!result.success) {
      next(result.error);
      return;
    }

    req.body = result.data;
    next();
  },
  createEvent,
);

/*
|--------------------------------------------------------------------------
| Publish Event
|--------------------------------------------------------------------------
|
| IMPORTANT:
| This route must come BEFORE "/:id"
| so "/:id/publish" is matched correctly.
|
*/

router.patch(
  "/:id/publish",
  authenticate,
  requireRole("ADMIN", "SUPER_ADMIN"),
  publishEvent,
);

/*
|--------------------------------------------------------------------------
| Update Event
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id",
  authenticate,
  requireRole("ADMIN", "SUPER_ADMIN"),
  (req, _res, next) => {
    const result = updateEventSchema.safeParse(req.body);

    if (!result.success) {
      next(result.error);
      return;
    }

    req.body = result.data;
    next();
  },
  updateEvent,
);

/*
|--------------------------------------------------------------------------
| Delete Event
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authenticate,
  requireRole("ADMIN", "SUPER_ADMIN"),
  deleteEvent,
);

export default router;
