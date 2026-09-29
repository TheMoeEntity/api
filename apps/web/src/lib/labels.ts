import type { PolicyRuleCode, RefundStatus, RefundVerdict } from "@refund-desk/shared";

import type { BadgeTone } from "@/types/ui.types";

/**
 * Record<PolicyRuleCode, string>: if the API gains a rule and this map
 * doesn't, the frontend stops compiling. The shared package enforces it.
 */
export const RULE_LABELS: Record<PolicyRuleCode, string> = {
  SEC_INJECTION_SUSPECTED: "Possible manipulation attempt",
  SEC_CLAIM_CONFLICTS_WITH_RECORD: "Claim conflicts with our records",
  DENY_FINAL_SALE_ITEM: "Final sale item",
  DENY_OUTSIDE_DEFECT_WINDOW: "Defect reported after 30 days",
  DENY_OUTSIDE_CHANGE_OF_MIND_WINDOW: "Change of mind after 14 days",
  DENY_ORDER_CANCELLED: "Order was cancelled",
  REVIEW_HIGH_VALUE: "Above $500, needs review",
  REVIEW_REPEAT_REQUESTER: "Frequent refund requests",
  REVIEW_ORDER_NOT_DELIVERED: "Order not delivered yet",
  REVIEW_UNCLEAR_REASON: "Reason unclear",
  APPROVE_DEFECT_WITHIN_WINDOW: "Defect within 30 days",
  APPROVE_CHANGE_OF_MIND_WITHIN_WINDOW: "Change of mind within 14 days",
  DEFAULT_FAIL_CLOSED: "No rule matched, sent to review",
};

export function ruleLabel(code: string): string {
  return RULE_LABELS[code as PolicyRuleCode] ?? code;
}

export const VERDICT_TONE: Record<RefundVerdict, BadgeTone> = {
  APPROVED: "success",
  DENIED: "danger",
  ESCALATED: "warning",
};

export const VERDICT_LABEL: Record<RefundVerdict, string> = {
  APPROVED: "Approved",
  DENIED: "Denied",
  ESCALATED: "Escalated",
};

export const STATUS_LABEL: Record<RefundStatus, string> = {
  DECIDED: "Decided",
  PENDING_REVIEW: "Pending review",
  RESOLVED: "Resolved",
};
