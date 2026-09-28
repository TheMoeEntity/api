import type { ErrorRequestHandler } from "express";
import type { Logger } from "pino";

import type { ApiErrorBody } from "@refund-desk/shared";

import { AppError } from "../errors/app-error.js";
import { isJsonParseError } from "../utils/http.utils.js";

/**
 * One place decides what errors look like on the wire.
 *
 * Express 5 forwards rejected promises from async handlers here
 * automatically, so no asyncHandler() wrapper is needed anymore.
 */
export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  return (err, req, res, _next) => {
    if (err instanceof AppError) {
      const body: ApiErrorBody = {
        error: { code: err.code, message: err.message, details: err.details },
      };
      res.status(err.statusCode).json(body);
      return;
    }

    if (isJsonParseError(err)) {
      const body: ApiErrorBody = {
        error: { code: "VALIDATION_FAILED", message: "Malformed JSON body" },
      };
      res.status(400).json(body);
      return;
    }

    // Unknown error = bug. Log everything, reveal nothing.
    logger.error({ err, requestId: req.id }, "Unhandled error");
    const body: ApiErrorBody = {
      error: { code: "INTERNAL_ERROR", message: "Something went wrong on our side" },
    };
    res.status(500).json(body);
  };
}
