import type {
  OrderStatus,
  ReasonCategory,
  RefundStatus,
  RefundVerdict,
  ReviewDecision,
} from "./refund.types.js";
import type { ExtractedClaims } from "./schema.types.js";

/**
 * Response shapes (DTOs). Dates are ISO strings because that's what
 * actually travels over JSON; a `Date` type here would be a lie.
 */

// ─── Customer-facing ────────────────────────────────────────

export interface CustomerSummaryDto {
  id: string;
  name: string;
  email: string;
}

export interface OrderItemDto {
  id: string;
  sku: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  isFinalSale: boolean;
}

export interface CustomerOrderDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  placedAt: string;
  deliveredAt: string | null;
  items: OrderItemDto[];
}

export interface CustomerOrdersDto {
  customer: CustomerSummaryDto;
  orders: CustomerOrderDto[];
}

export interface RefundDecisionDto {
  id: string;
  verdict: RefundVerdict;
  status: RefundStatus;
  refundAmountCents: number;
  customerReply: string;
  createdAt: string;
  /** true when this was a retried submission returning the original result. */
  replayed: boolean;
}

// ─── Admin ──────────────────────────────────────────────────

export interface RefundListItemDto {
  id: string;
  createdAt: string;
  customerName: string;
  orderNumber: string;
  amountCents: number;
  verdict: RefundVerdict;
  status: RefundStatus;
  reasonCategory: ReasonCategory | null;
  decidingRule: string | null;
}

export interface RefundStatsDto {
  total: number;
  approved: number;
  denied: number;
  escalated: number;
  pendingReview: number;
}

export interface DecisionAuditDto {
  extractedClaims: ExtractedClaims | null;
  injectionSignals: string[];
  /** Stored as plain strings in the DB; values come from POLICY_RULE_CODES. */
  rulesTriggered: string[];
  decidingRule: string;
  aiProvider: string;
  model: string | null;
  promptVersion: string | null;
  aiFallbackUsed: boolean;
  latencyMs: number;
  tokensIn: number | null;
  tokensOut: number | null;
}

export interface ReviewActionDto {
  id: string;
  decision: ReviewDecision;
  reviewerName: string;
  note: string;
  createdAt: string;
}

export interface RefundDetailDto extends RefundListItemDto {
  customerEmail: string;
  message: string;
  customerReply: string;
  items: Array<{ name: string; quantity: number; unitPriceCents: number; isFinalSale: boolean }>;
  /** null only for historical records imported before the system existed. */
  audit: DecisionAuditDto | null;
  reviewActions: ReviewActionDto[];
}
