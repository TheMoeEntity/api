import type {
  ORDER_STATUSES,
  POLICY_RULE_CODES,
  REASON_CATEGORIES,
  REFUND_STATUSES,
  REFUND_VERDICTS,
  REVIEW_DECISIONS,
} from "../constants/refund.constants.js";

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type RefundVerdict = (typeof REFUND_VERDICTS)[number];
export type RefundStatus = (typeof REFUND_STATUSES)[number];
export type ReasonCategory = (typeof REASON_CATEGORIES)[number];
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];
export type PolicyRuleCode = (typeof POLICY_RULE_CODES)[number];
