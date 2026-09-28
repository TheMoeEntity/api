import type { PolicyConfig } from "../types/policy.types.js";

/**
 * Mirrors docs/REFUND_POLICY.md. Change a number here, not in a rule.
 */
export const defaultPolicyConfig: PolicyConfig = {
  defectWindowDays: 30,
  changeOfMindWindowDays: 14,
  highValueThresholdCents: 50_000, // $500.00, reviewed only when ABOVE this
  repeatRequestWindowDays: 60,
  repeatRequestLimit: 3,
};
