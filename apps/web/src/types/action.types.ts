import type { RefundDecisionDto, RefundDetailDto } from "@refund-desk/shared";

/**
 * What a server action hands back to the form that called it.
 * Discriminated by `status`, so the component must handle each case.
 */
export type SubmitRefundState =
  | { status: "idle" }
  | { status: "success"; decision: RefundDecisionDto; customerMessage: string; submittedAt: number }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]>; submittedAt: number };

export type ReviewRefundState =
  | { status: "idle" }
  | { status: "success"; detail: RefundDetailDto }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };
