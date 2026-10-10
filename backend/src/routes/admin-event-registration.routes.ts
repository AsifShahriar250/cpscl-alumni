import { Router } from "express";

import {
  cancelRegistrationByAdmin,
  deleteRegistration,
  getEventRegistrationStats,
  getEventRegistrations,
  markRegistrationAttended,
} from "../controllers/admin-event-registration.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Admin Event Registration Routes
|--------------------------------------------------------------------------
|
| GET   /api/v1/admin/events/:eventId/registrations
| GET   /api/v1/admin/events/:eventId/registrations/stats
| PATCH /api/v1/admin/event-registrations/:registrationId/attended
| PATCH /api/v1/admin/event-registrations/:registrationId/cancel
|
*/

/*
|--------------------------------------------------------------------------
| Get all registrations for an event
|--------------------------------------------------------------------------
*/

router.get(
  "/events/:eventId/registrations",
  authenticate,
  requireRole("ADMIN", "SUPER_ADMIN"),
  getEventRegistrations,
);

/*
|--------------------------------------------------------------------------
| Get event registration statistics
|--------------------------------------------------------------------------
*/

router.get(
  "/events/:eventId/registrations/stats",
  authenticate,
  requireRole("ADMIN", "SUPER_ADMIN"),
  getEventRegistrationStats,
);

/*
|--------------------------------------------------------------------------
| Mark registration as attended
|--------------------------------------------------------------------------
*/

router.patch(
  "/event-registrations/:registrationId/attended",
  authenticate,
  requireRole("ADMIN", "SUPER_ADMIN"),
  markRegistrationAttended,
);

/*
|--------------------------------------------------------------------------
| Cancel registration
|--------------------------------------------------------------------------
*/

router.patch(
  "/event-registrations/:registrationId/cancel",
  authenticate,
  requireRole("ADMIN", "SUPER_ADMIN"),
  cancelRegistrationByAdmin,
);

/*
|--------------------------------------------------------------------------
| Delete Cancelled Registration
|--------------------------------------------------------------------------
*/

router.delete(
  "/event-registrations/:registrationId",
  authenticate,
  requireRole("ADMIN", "SUPER_ADMIN"),
  deleteRegistration,
);

export default router;