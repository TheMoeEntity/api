import "server-only";

import { z } from "zod";

import type { WebEnv } from "@/types/env.types";

const envSchema = z.object({
  API_URL: z.url().default("http://localhost:4000"),
  ADMIN_API_KEY: z.string().min(12).default("local-dev-admin-key"),
});

/**
 * Read at request time, not at build time: the Docker image is built
 * without these values and receives them when the container starts.
 */
export function getEnv(): WebEnv {
  return envSchema.parse({
    API_URL: process.env.API_URL || undefined,
    ADMIN_API_KEY: process.env.ADMIN_API_KEY || undefined,
  });
}
