import { Router } from "express";
import {
  cancelRegistration,
  getMyRegistration,
  registerForEvent,
} from "../controllers/event-registration.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Event Registration Routes
|--------------------------------------------------------------------------
|
| POST   /api/v1/events/:eventId/registrations
| GET    /api/v1/events/:eventId/registrations/me
| PATCH  /api/v1/events/:eventId/registrations/cancel
|
*/

/*
|--------------------------------------------------------------------------
| Register for Event
|--------------------------------------------------------------------------
*/

router.post(
  "/:eventId/registrations",
  authenticate,
  registerForEvent,
);

/*
|--------------------------------------------------------------------------
| Get My Registration
|--------------------------------------------------------------------------
*/

router.get(
  "/:eventId/registrations/me",
  authenticate,
  getMyRegistration,
);

/*
|--------------------------------------------------------------------------
| Cancel Registration
|--------------------------------------------------------------------------
*/

router.patch(
  "/:eventId/registrations/cancel",
  authenticate,
  cancelRegistration,
);

export default router;