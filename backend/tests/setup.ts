
import dotenv from "dotenv";

const result = dotenv.config({
  path: ".env.test",
  override: true,
});

if (result.error) {
  throw new Error("Could not load .env.test");
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing in .env.test");
}

const parsedUrl = new URL(databaseUrl);

if (
  parsedUrl.hostname !== "localhost" ||
  parsedUrl.pathname !== "/cpscl_alumni_test"
) {
  throw new Error(
    "Tests blocked: only the local cpscl_alumni_test database is allowed",
  );
}

process.env.NODE_ENV = "test";
