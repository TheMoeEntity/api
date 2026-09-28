/**
 * Compile-time guard: the Prisma enums and the shared constants must list
 * the same values. If someone adds a verdict to one and forgets the other,
 * `pnpm typecheck` fails here instead of the app failing in production.
 */
import type {
  OrderStatus,
  ReasonCategory,
  RefundStatus,
  RefundVerdict,
  ReviewDecision,
} from "@refund-desk/shared";

import type {
  OrderStatus as DbOrderStatus,
  ReasonCategory as DbReasonCategory,
  RefundStatus as DbRefundStatus,
  RefundVerdict as DbRefundVerdict,
  ReviewDecision as DbReviewDecision,
} from "../generated/prisma/enums.js";
import type { Assert, Equals } from "./type-utils.types.js";

export type EnumParityChecks = [
  Assert<Equals<DbOrderStatus, OrderStatus>>,
  Assert<Equals<DbRefundVerdict, RefundVerdict>>,
  Assert<Equals<DbRefundStatus, RefundStatus>>,
  Assert<Equals<DbReasonCategory, ReasonCategory>>,
  Assert<Equals<DbReviewDecision, ReviewDecision>>,
];
