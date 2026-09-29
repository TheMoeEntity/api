import { pino, type Logger } from "pino";

import type { Env } from "../../types/env.types.js";

export function createLogger(env: Env): Logger {
  return pino({
    level: env.LOG_LEVEL,
    // Never let a secret reach the logs, even by accident.
    redact: ["req.headers.authorization", "req.headers.cookie", "req.headers[\"x-admin-key\"]", "*.apiKey"],
    // Human-readable locally, raw JSON in production (for log aggregators).
    ...(env.NODE_ENV === "development"
      ? { transport: { target: "pino-pretty", options: { colorize: true } } }
      : {}),
  });
}
