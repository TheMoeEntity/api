import type { RequestHandler } from "express";
import type { z } from "zod";

import { parseOrThrow } from "../utils/validation.utils.js";

/**
 * Reusable body validator. Controllers downstream receive a body that has
 * already been parsed, trimmed and type-checked by the shared schema.
 */
export function validateBody(schema: z.ZodType): RequestHandler {
  return (req, _res, next) => {
    req.body = parseOrThrow(schema, req.body, "Request body");
    next();
  };
}
