import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const databaseUrl = new URL(env("DATABASE_URL"));
databaseUrl.pathname = "/cpscl_alumni_test";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl.toString(),
  },
});
