import type { RateLimitConfig } from "../types/rate-limit.types.js";

/**
 * Each refund submission can cost two paid LLM calls, so this route is
 * the one worth protecting. Generous enough that a reviewer clicking
 * through every scenario never hits it.
 */
export const refundSubmitRateLimit: RateLimitConfig = {
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 10,                // submissions per customer per window
};
