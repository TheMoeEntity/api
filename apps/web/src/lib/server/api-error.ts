import type { ApiErrorCode } from "@refund-desk/shared";

/** A failed API call, carrying the API's own error code and message. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
