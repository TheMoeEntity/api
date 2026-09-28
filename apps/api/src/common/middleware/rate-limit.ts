import type { RequestHandler } from "express";
import { rateLimit } from "express-rate-limit";

import type { RateLimitConfig } from "../../types/rate-limit.types.js";
import { AppError } from "../errors/app-error.js";

/**
 * Limits refund submissions per CUSTOMER, not per IP.
 *
 * Why: in production the browser talks to the Next.js server, and the
 * Next.js server talks to this API. Every request arrives from the same
 * IP (the Next.js server), so a per-IP limit would throttle ALL customers
 * together. Must run after validateBody, so customerId is a valid UUID.
 *
 * Store: in-memory, which is correct for one API instance. With several
 * instances behind a load balancer, each would count separately, so you'd
 * swap in a Redis store (rate-limit-redis) and they'd share one counter.
 */
export function createCustomerRateLimit(config: RateLimitConfig): RequestHandler {
  return rateLimit({
    windowMs: config.windowMs,
    limit: config.limit,
    standardHeaders: "draft-8", // RateLimit headers tell clients when to retry
    legacyHeaders: false,
    keyGenerator: (req) => `customer:${(req.body as { customerId: string }).customerId}`,
    handler: (_req, _res, next) => {
      next(AppError.tooManyRequests("Too many refund requests. Please try again in a few minutes."));
    },
  });
}
