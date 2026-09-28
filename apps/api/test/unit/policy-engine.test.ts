import { describe, expect, it } from "vitest";

import { daysAgo } from "../../src/common/utils/date.utils.js";
import { evaluatePolicy } from "../../src/policy/policy.engine.js";
import type { PolicyContext } from "../../src/types/policy.types.js";

const NOW = new Date("2026-09-27T12:00:00.000Z");

/** A context that approves by default; each test changes one thing. */
function context(overrides: Partial<PolicyContext> = {}): PolicyContext {
  return {
    now: NOW,
    order: { status: "DELIVERED", deliveredAt: daysAgo(5, NOW) },
    items: [{ unitPriceCents: 10_000, quantity: 1, isFinalSale: false }],
    refundAmountCents: 10_000,
    recentRequestCount: 0,
    injectionSignals: [],
    claims: { reasonCategory: "DAMAGED", manipulationAttempt: false },
    ...overrides,
  };
}

describe("evaluatePolicy", () => {
  it("approves a damaged item within the window", () => {
    expect(evaluatePolicy(context())).toMatchObject({
      verdict: "APPROVED",
      decidingRule: "APPROVE_DEFECT_WITHIN_WINDOW",
    });
  });

  describe("boundaries", () => {
    it("approves on exactly day 30 and denies on day 31", () => {
      const day30 = context({ order: { status: "DELIVERED", deliveredAt: daysAgo(30, NOW) } });
      const day31 = context({ order: { status: "DELIVERED", deliveredAt: daysAgo(31, NOW) } });
      expect(evaluatePolicy(day30).verdict).toBe("APPROVED");
      expect(evaluatePolicy(day31).decidingRule).toBe("DENY_OUTSIDE_DEFECT_WINDOW");
    });

    it("does not review exactly $500.00, but does review $500.01", () => {
      expect(evaluatePolicy(context({ refundAmountCents: 50_000 })).verdict).toBe("APPROVED");
      expect(evaluatePolicy(context({ refundAmountCents: 50_001 })).decidingRule).toBe("REVIEW_HIGH_VALUE");
    });

    it("reviews at the repeat limit, not one below it", () => {
      expect(evaluatePolicy(context({ recentRequestCount: 2 })).verdict).toBe("APPROVED");
      expect(evaluatePolicy(context({ recentRequestCount: 3 })).decidingRule).toBe("REVIEW_REPEAT_REQUESTER");
    });
  });

  describe("precedence", () => {
    it("security beats everything, even an otherwise valid claim", () => {
      const result = evaluatePolicy(context({ injectionSignals: ["INSTRUCTION_OVERRIDE"] }));
      expect(result).toMatchObject({ verdict: "ESCALATED", decidingRule: "SEC_INJECTION_SUSPECTED" });
    });

    it("deny beats review, but the audit still records both", () => {
      const result = evaluatePolicy(
        context({
          items: [{ unitPriceCents: 80_000, quantity: 1, isFinalSale: true }],
          refundAmountCents: 80_000,
        }),
      );
      expect(result.verdict).toBe("DENIED");
      expect(result.decidingRule).toBe("DENY_FINAL_SALE_ITEM");
      expect(result.rulesTriggered).toContain("REVIEW_HIGH_VALUE");
    });

    it("trusts the model's own manipulation flag even if the scanner saw nothing", () => {
      const result = evaluatePolicy(context({ claims: { reasonCategory: "DAMAGED", manipulationAttempt: true } }));
      expect(result.decidingRule).toBe("SEC_INJECTION_SUSPECTED");
    });
  });

  describe("fail closed", () => {
    it("escalates when the AI produced no claims", () => {
      expect(evaluatePolicy(context({ claims: null }))).toMatchObject({
        verdict: "ESCALATED",
        decidingRule: "REVIEW_UNCLEAR_REASON",
      });
    });

    it("never approves when no rule matches", () => {
      // NOT_AS_DESCRIBED... but order is DELIVERED with no delivery date (bad data)
      const result = evaluatePolicy(context({ order: { status: "DELIVERED", deliveredAt: null } }));
      expect(result).toMatchObject({ verdict: "ESCALATED", decidingRule: "DEFAULT_FAIL_CLOSED" });
    });
  });
});
