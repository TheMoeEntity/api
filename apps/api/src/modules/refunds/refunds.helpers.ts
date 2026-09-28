import type { CreateRefundRequestInput, RefundDecisionDto } from "@refund-desk/shared";

import { AppError } from "../../common/errors/app-error.js";
import type { OrderItemRecord, RefundRecord, SelectedItem } from "../../types/refund.types.js";

/**
 * Match what the client asked for against what the order actually holds.
 * The client names items by id; prices and flags always come from our DB.
 */
export function resolveSelectedItems(
  orderItems: OrderItemRecord[],
  requested: CreateRefundRequestInput["items"],
): SelectedItem[] {
  const byId = new Map(orderItems.map((item) => [item.id, item]));
  const seen = new Set<string>();

  return requested.map(({ orderItemId, quantity }) => {
    const item = byId.get(orderItemId);
    if (!item) throw AppError.badRequest("One of the selected items is not part of this order");
    if (seen.has(orderItemId)) throw AppError.badRequest("An item was selected more than once");
    if (quantity > item.quantity) {
      throw AppError.badRequest(`You can't refund more than ${item.quantity} of "${item.name}"`);
    }
    seen.add(orderItemId);
    return { item, quantity };
  });
}

export function toRefundDecisionDto(record: RefundRecord, replayed: boolean): RefundDecisionDto {
  return {
    id: record.id,
    verdict: record.verdict,
    status: record.status,
    refundAmountCents: record.amountCents,
    customerReply: record.customerReply,
    createdAt: record.createdAt.toISOString(),
    replayed,
  };
}
