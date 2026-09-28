import type { RefundVerdict } from "@refund-desk/shared";

import type {
  PolicyConfig,
  PolicyContext,
  PolicyDecision,
  PolicyRule,
  RuleGroup,
} from "../types/policy.types.js";
import { defaultPolicyConfig } from "./policy.config.js";
import { allRules } from "./rules/index.js";

/** Highest priority first. The first group with a fired rule decides. */
const GROUP_PRECEDENCE: ReadonlyArray<{ group: RuleGroup; verdict: RefundVerdict }> = [
  { group: "SECURITY", verdict: "ESCALATED" },
  { group: "DENY", verdict: "DENIED" },
  { group: "REVIEW", verdict: "ESCALATED" },
  { group: "APPROVE", verdict: "APPROVED" },
];

/**
 * Pure function: no database, no AI, no clock (time comes in via ctx.now).
 * That's what makes it trivially unit-testable and fully explainable.
 *
 * Every rule is evaluated (not short-circuited) so the audit log shows the
 * full picture, e.g. "denied for final sale, AND it was also high value".
 */
export function evaluatePolicy(
  ctx: PolicyContext,
  config: PolicyConfig = defaultPolicyConfig,
  rules: PolicyRule[] = allRules,
): PolicyDecision {
  const fired = rules.filter((rule) => rule.applies(ctx, config));
  const rulesTriggered = fired.map((rule) => rule.code);

  for (const { group, verdict } of GROUP_PRECEDENCE) {
    const winner = fired.find((rule) => rule.group === group);
    if (winner) {
      return { verdict, decidingRule: winner.code, rulesTriggered };
    }
  }

  // Nothing matched: a human decides. Money systems never fail open.
  return {
    verdict: "ESCALATED",
    decidingRule: "DEFAULT_FAIL_CLOSED",
    rulesTriggered: [...rulesTriggered, "DEFAULT_FAIL_CLOSED"],
  };
}
