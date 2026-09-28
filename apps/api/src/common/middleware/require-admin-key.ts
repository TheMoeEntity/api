import { timingSafeEqual } from "node:crypto";

import type { RequestHandler } from "express";

import { AppError } from "../errors/app-error.js";

/**
 * Minimal shared-secret guard for admin routes. The Next.js server sends
 * the key; the browser never sees it. Real auth (SSO, roles) is listed in
 * the README as the production upgrade.
 *
 * timingSafeEqual: a normal === returns faster the earlier strings differ,
 * which leaks the key one character at a time to a patient attacker.
 */
export function requireAdminKey(expectedKey: string): RequestHandler {
  const expected = Buffer.from(expectedKey);

  return (req, _res, next) => {
    const provided = Buffer.from(req.header("x-admin-key") ?? "");
    const valid = provided.length === expected.length && timingSafeEqual(provided, expected);
    if (!valid) throw AppError.unauthorized("Admin key missing or invalid");
    next();
  };
}
