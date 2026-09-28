import { z } from "zod";

import { AppError } from "../errors/app-error.js";

/** Parse with a Zod schema, or throw a 400 AppError. Returns typed data. */
export function parseOrThrow<T extends z.ZodType>(schema: T, value: unknown, label = "Request"): z.infer<T> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw AppError.badRequest(`${label} is invalid`, z.flattenError(result.error));
  }
  return result.data;
}

const uuidSchema = z.uuid();

/** Route ids that aren't valid UUIDs can't exist, so they're a 404, not a DB error. */
export function parseIdParam(value: unknown, resource: string): string {
  const result = uuidSchema.safeParse(value);
  if (!result.success) throw AppError.notFound(`${resource} not found`);
  return result.data;
}
