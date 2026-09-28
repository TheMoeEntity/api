import type { ReasonCategory } from "@refund-desk/shared";

import { daysBetween } from "../common/utils/date.utils.js";
import type { PolicyContext } from "../types/policy.types.js";

const DEFECT_REASONS: ReadonlySet<ReasonCategory> = new Set([
  "DAMAGED",
  "WRONG_ITEM",
  "NOT_AS_DESCRIBED",
]);

export function isDefectReason(ctx: PolicyContext): boolean {
  return ctx.claims !== null && DEFECT_REASONS.has(ctx.claims.reasonCategory);
}

export function isChangeOfMind(ctx: PolicyContext): boolean {
  return ctx.claims?.reasonCategory === "CHANGED_MIND";
}

/** Days since delivery, or null if the order hasn't been delivered. */
export function daysSinceDelivery(ctx: PolicyContext): number | null {
  if (ctx.order.status !== "DELIVERED" || ctx.order.deliveredAt === null) return null;
  return daysBetween(ctx.order.deliveredAt, ctx.now);
}
