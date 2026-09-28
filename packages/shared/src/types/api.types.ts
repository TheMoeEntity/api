import type { API_ERROR_CODES } from "../constants/api.constants.js";

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

/** Every non-2xx response from the API has exactly this shape. */
export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}
