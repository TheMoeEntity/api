import type {
  OrderStatus,
  PolicyRuleCode,
  ReasonCategory,
  RefundVerdict,
} from "@refund-desk/shared";

/** Business thresholds. Numbers only; no logic lives here. */
export interface PolicyConfig {
  defectWindowDays: number;
  changeOfMindWindowDays: number;
  highValueThresholdCents: number;
  repeatRequestWindowDays: number;
  repeatRequestLimit: number;
}

export interface PolicyItem {
  unitPriceCents: number;
  quantity: number;
  isFinalSale: boolean;
}

/**
 * Everything a rule may look at. Split by trust level on purpose:
 * `order`, `items`, `refundAmountCents`, `recentRequestCount` come from
 * our database; `claims` comes from the AI reading the customer's text;
 * `injectionSignals` comes from our own deterministic scanner.
 */
export interface PolicyContext {
  now: Date;
  order: {
    status: OrderStatus;
    deliveredAt: Date | null;
  };
  items: PolicyItem[];
  refundAmountCents: number;
  recentRequestCount: number;
  injectionSignals: string[];
  /** null when the AI was unavailable or returned something invalid. */
  claims: {
    reasonCategory: ReasonCategory;
    manipulationAttempt: boolean;
  } | null;
}

export type RuleGroup = "SECURITY" | "DENY" | "REVIEW" | "APPROVE";

export interface PolicyRule {
  code: PolicyRuleCode;
  group: RuleGroup;
  /** Pure: same context + config in, same answer out. No I/O. */
  applies: (ctx: PolicyContext, config: PolicyConfig) => boolean;
}

export interface PolicyDecision {
  verdict: RefundVerdict;
  /** The rule that decided the verdict. */
  decidingRule: PolicyRuleCode;
  /** Every rule that fired, for the audit log. */
  rulesTriggered: PolicyRuleCode[];
}
