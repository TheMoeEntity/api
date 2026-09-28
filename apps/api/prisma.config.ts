import "dotenv/config";

import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 moved connection config out of schema.prisma and into this
 * file (same change you hit on the Book Review API).
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
