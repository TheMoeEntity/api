import type { PolicyRule } from "../../types/policy.types.js";

export const securityRules: PolicyRule[] = [
  {
    code: "SEC_INJECTION_SUSPECTED",
    group: "SECURITY",
    // Two independent detectors: our regex scanner AND the model's own read.
    // Either one is enough. Defence in depth.
    applies: (ctx) => ctx.injectionSignals.length > 0 || ctx.claims?.manipulationAttempt === true,
  },
  {
    code: "SEC_CLAIM_CONFLICTS_WITH_RECORD",
    group: "SECURITY",
    // "It never arrived" on an order our carrier marked delivered.
    applies: (ctx) =>
      ctx.claims?.reasonCategory === "NOT_RECEIVED" && ctx.order.status === "DELIVERED",
  },
];
