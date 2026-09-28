import type { PolicyRuleCode } from "@refund-desk/shared";

import type { PolicyConfig } from "../types/policy.types.js";

/**
 * Customer-safe wording for every rule. Security rules deliberately
 * sound like routine review: we never tell someone they were flagged.
 */
export function explainRule(code: PolicyRuleCode, config: PolicyConfig): string {
  switch (code) {
    case "SEC_INJECTION_SUSPECTED":
      return "Your request needs a closer look from a member of our support team.";
    case "SEC_CLAIM_CONFLICTS_WITH_RECORD":
      return "A member of our team will check the delivery details for this order with you personally.";
    case "DENY_ORDER_CANCELLED":
      return "This order was cancelled before it was charged, so there is no payment to refund.";
    case "DENY_FINAL_SALE_ITEM":
      return "At least one of the selected items was sold as final sale, and final sale items aren't eligible for refunds.";
    case "DENY_OUTSIDE_DEFECT_WINDOW":
      return `Problems with an item need to be reported within ${config.defectWindowDays} days of delivery, and this order is outside that window.`;
    case "DENY_OUTSIDE_CHANGE_OF_MIND_WINDOW":
      return `Change-of-mind returns are accepted within ${config.changeOfMindWindowDays} days of delivery, and this order is outside that window.`;
    case "REVIEW_HIGH_VALUE":
      return "Refunds of this amount are reviewed by a member of our team before they're issued.";
    case "REVIEW_REPEAT_REQUESTER":
      return "A member of our team will review your request personally.";
    case "REVIEW_ORDER_NOT_DELIVERED":
      return "Your order hasn't been delivered yet, so our shipping team will check on it.";
    case "REVIEW_UNCLEAR_REASON":
      return "We'd like to understand the issue a little better, so a member of our team will follow up.";
    case "APPROVE_DEFECT_WITHIN_WINDOW":
      return "We're sorry the item didn't arrive as it should have.";
    case "APPROVE_CHANGE_OF_MIND_WITHIN_WINDOW":
      return "Your request is within our change-of-mind return window.";
    case "DEFAULT_FAIL_CLOSED":
      return "A member of our team will review your request.";
  }
}
