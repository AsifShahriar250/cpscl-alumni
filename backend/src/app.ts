
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { globalErrorHandler } from "./middleware/error.middleware.js";

import adminRoutes from "./routes/admin.routes.js";
import alumniDirectoryRoutes from "./routes/alumni-directory.routes.js";
import alumniProfileRoutes from "./routes/alumni-profile.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminEventRegistrationRoutes from "./routes/admin-event-registration.routes.js";
import batchRoutes from "./routes/batch.routes.js";
import eventRoutes from "./routes/event.routes.js";
import eventRegistrationRoutes from "./routes/event-registration.routes.js";
import memoryRoutes from "./routes/memory.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/admin", adminEventRegistrationRoutes);
app.use("/api/v1/alumni-profile", alumniProfileRoutes);
app.use("/api/v1/alumni", alumniDirectoryRoutes);
app.use("/api/v1/batches", batchRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/events", eventRegistrationRoutes);
app.use("/api/v1/memories", memoryRoutes);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "CPSCL Alumni Platform API is running",
    environment: env.nodeEnv,
  });
});

app.use(globalErrorHandler);

export default app;
