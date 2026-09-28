import { z } from "zod";

import type { Env } from "../types/env.types.js";

/**
 * Validated once at boot. Anything else in the app imports the parsed
 * `Env` object, never `process.env` directly.
 *
 * Why: a missing DATABASE_URL should crash the process on startup with
 * a clear message, not surface as a vague connection error on the first
 * request an hour later. Fail fast, fail loud.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),

  // Empty string → undefined, so an empty value in .env means "use the mock provider".
  ANTHROPIC_API_KEY: z
    .string()
    .optional()
    .transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined)),
  ANTHROPIC_MODEL: z.string().min(1).default("claude-sonnet-5"),
  AI_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),

  // Shared secret between the Next.js server and the admin API.
  // The default exists so `docker compose up` works out of the box; any
  // real deployment sets its own.
  ADMIN_API_KEY: z.string().min(12).default("local-dev-admin-key"),
});

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    // Logger isn't built yet (it depends on env), so console is correct here.
    console.error("Invalid environment configuration:\n" + z.prettifyError(result.error));
    process.exit(1);
  }

  return result.data;
}
