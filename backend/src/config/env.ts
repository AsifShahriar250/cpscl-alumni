import dotenv from "dotenv";

if (process.env.NODE_ENV !== "test") {
  dotenv.config();
}
const port = Number(process.env.PORT);
const databaseUrl = process.env.DATABASE_URL;
const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
const jwtAccessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN;

if (!port || port <= 0) {
  throw new Error("PORT must be a valid positive number");
}

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

if (!jwtAccessSecret || jwtAccessSecret.length < 32) {
  throw new Error("JWT_ACCESS_SECRET must be at least 32 characters");
}

if (!jwtAccessExpiresIn) {
  throw new Error("JWT_ACCESS_EXPIRES_IN is required");
}

export const env = {
  port,
  databaseUrl,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtAccessSecret,
  jwtAccessExpiresIn,
} as const;
