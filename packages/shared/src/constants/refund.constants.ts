/**
 * Single source of truth for refund vocabulary.
 *
 * Why `as const` arrays instead of TS enums?
 * - They exist at runtime, so Zod can validate against them.
 * - Their union types are derived from them, so the list and the type
 *   can never drift apart.
 * - The Prisma enums in apps/api mirror these values; the API asserts
 *   that at compile time (see apps/api/src/types/enum-parity.types.ts).
 */

export const ORDER_STATUSES = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export const REFUND_VERDICTS = ["APPROVED", "DENIED", "ESCALATED"] as const;

/** Lifecycle of a request, separate from the verdict. */
export const REFUND_STATUSES = ["DECIDED", "PENDING_REVIEW", "RESOLVED"] as const;

/** What the AI extractor may classify a customer's reason as. */
export const REASON_CATEGORIES = [
  "DAMAGED",
  "WRONG_ITEM",
  "NOT_AS_DESCRIBED",
  "NOT_RECEIVED",
  "CHANGED_MIND",
  "OTHER",
] as const;

/** What a human reviewer can decide on an escalated request. */
export const REVIEW_DECISIONS = ["APPROVE", "DENY"] as const;

/**
 * Every rule the policy engine can fire. These codes appear in the audit
 * log, the admin dashboard and docs/REFUND_POLICY.md: one vocabulary
 * everywhere.
 */
export const POLICY_RULE_CODES = [
  // Security: always escalate
  "SEC_INJECTION_SUSPECTED",
  "SEC_CLAIM_CONFLICTS_WITH_RECORD",
  // Hard denials
  "DENY_FINAL_SALE_ITEM",
  "DENY_OUTSIDE_DEFECT_WINDOW",
  "DENY_OUTSIDE_CHANGE_OF_MIND_WINDOW",
  "DENY_ORDER_CANCELLED",
  // Human review
  "REVIEW_HIGH_VALUE",
  "REVIEW_REPEAT_REQUESTER",
  "REVIEW_ORDER_NOT_DELIVERED",
  "REVIEW_UNCLEAR_REASON",
  // Approvals
  "APPROVE_DEFECT_WITHIN_WINDOW",
  "APPROVE_CHANGE_OF_MIND_WITHIN_WINDOW",
  // Fallback
  "DEFAULT_FAIL_CLOSED",
] as const;

export const REFUND_MESSAGE_MAX_LENGTH = 2000;
export const REFUND_MESSAGE_MIN_LENGTH = 10;
