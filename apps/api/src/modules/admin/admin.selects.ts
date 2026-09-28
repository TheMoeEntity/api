import type { Prisma } from "../../generated/prisma/client.js";

/**
 * Select shapes live in one place. The record TYPES are derived from them
 * (see types/admin.types.ts), so the query and its type can never disagree.
 */
export const refundListSelect = {
  id: true,
  createdAt: true,
  amountCents: true,
  verdict: true,
  status: true,
  reasonCategory: true,
  customer: { select: { name: true } },
  order: { select: { orderNumber: true } },
  audit: { select: { decidingRule: true } },
} satisfies Prisma.RefundRequestSelect;

export const refundDetailSelect = {
  ...refundListSelect,
  message: true,
  customerReply: true,
  customer: { select: { name: true, email: true } },
  items: {
    select: {
      quantity: true,
      orderItem: { select: { name: true, unitPriceCents: true, isFinalSale: true } },
    },
  },
  audit: true,
  reviewActions: { orderBy: { createdAt: "asc" } },
} satisfies Prisma.RefundRequestSelect;
