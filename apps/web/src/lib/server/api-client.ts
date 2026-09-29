import "server-only";

import { randomUUID } from "node:crypto";

import type {
  ApiErrorBody,
  CreateRefundRequestInput,
  CustomerOrdersDto,
  CustomerSummaryDto,
  RefundDecisionDto,
  RefundDetailDto,
  RefundListItemDto,
  RefundStatsDto,
  ReviewRefundRequestInput,
} from "@refund-desk/shared";

import { ApiError } from "./api-error";
import { getEnv } from "./env";

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  admin?: boolean;
}

/**
 * The ONLY place the web app talks to the API. `server-only` makes the
 * build fail if a client component ever imports this file, which is
 * what keeps the admin key out of the browser bundle.
 */
async function request<T>(path: string, { method = "GET", body, admin = false }: RequestOptions = {}): Promise<T> {
  const env = getEnv();
  const headers: Record<string, string> = {
    // One id per call; the API logs it too, so one click is traceable across both services.
    "x-request-id": randomUUID(),
  };
  if (body !== undefined) headers["content-type"] = "application/json";
  if (admin) headers["x-admin-key"] = env.ADMIN_API_KEY;

  let response: Response;
  try {
    response = await fetch(`${env.API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(503, "SERVICE_UNAVAILABLE", "We couldn't reach the refund service. Please try again shortly.");
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error = (payload as ApiErrorBody | null)?.error;
    throw new ApiError(
      response.status,
      error?.code ?? "INTERNAL_ERROR",
      error?.message ?? "Something went wrong on our side.",
      error?.details,
    );
  }

  return payload as T;
}

export const apiClient = {
  listCustomers: () => request<CustomerSummaryDto[]>("/customers"),
  getCustomerOrders: (customerId: string) =>
    request<CustomerOrdersDto>(`/customers/${encodeURIComponent(customerId)}/orders`),
  submitRefund: (input: CreateRefundRequestInput) =>
    request<RefundDecisionDto>("/refund-requests", { method: "POST", body: input }),

  listRefunds: (query: URLSearchParams) =>
    request<RefundListItemDto[]>(`/admin/refund-requests?${query.toString()}`, { admin: true }),
  getStats: () => request<RefundStatsDto>("/admin/refund-requests/stats", { admin: true }),
  getRefund: (id: string) =>
    request<RefundDetailDto>(`/admin/refund-requests/${encodeURIComponent(id)}`, { admin: true }),
  reviewRefund: (id: string, input: ReviewRefundRequestInput) =>
    request<RefundDetailDto>(`/admin/refund-requests/${encodeURIComponent(id)}/review`, {
      method: "POST",
      body: input,
      admin: true,
    }),
};
