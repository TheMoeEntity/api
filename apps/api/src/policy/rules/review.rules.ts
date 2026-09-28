import type { PolicyRule } from "../../types/policy.types.js";

export const reviewRules: PolicyRule[] = [
  {
    code: "REVIEW_ORDER_NOT_DELIVERED",
    group: "REVIEW",
    applies: (ctx) => ctx.order.status === "PROCESSING" || ctx.order.status === "SHIPPED",
  },
  {
    code: "REVIEW_HIGH_VALUE",
    group: "REVIEW",
    // Strictly ABOVE: exactly $500.00 is not reviewed.
    applies: (ctx, config) => ctx.refundAmountCents > config.highValueThresholdCents,
  },
  {
    code: "REVIEW_REPEAT_REQUESTER",
    group: "REVIEW",
    applies: (ctx, config) => ctx.recentRequestCount >= config.repeatRequestLimit,
  },
  {
    code: "REVIEW_UNCLEAR_REASON",
    group: "REVIEW",
    // No claims at all (AI down) is treated the same as an unclear reason:
    // a human decides. This is the fail-closed path.
    applies: (ctx) => ctx.claims === null || ctx.claims.reasonCategory === "OTHER",
  },
];
