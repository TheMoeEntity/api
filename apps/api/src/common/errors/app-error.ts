import type { ApiErrorCode } from "@refund-desk/shared";

/**
 * The only error type services are allowed to throw on purpose.
 * Anything that is NOT an AppError reaching the error handler is,
 * by definition, a bug, and gets logged as one.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: ApiErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }

  static badRequest(message: string, details?: unknown): AppError {
    return new AppError(400, "VALIDATION_FAILED", message, details);
  }

  static unauthorized(message: string): AppError {
    return new AppError(401, "UNAUTHORIZED", message);
  }

  static notFound(message: string): AppError {
    return new AppError(404, "NOT_FOUND", message);
  }

  static conflict(message: string): AppError {
    return new AppError(409, "CONFLICT", message);
  }

  static tooManyRequests(message: string): AppError {
    return new AppError(429, "RATE_LIMITED", message);
  }

  static serviceUnavailable(message: string): AppError {
    return new AppError(503, "SERVICE_UNAVAILABLE", message);
  }
}
