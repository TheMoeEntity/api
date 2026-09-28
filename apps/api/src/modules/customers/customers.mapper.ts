import type { CustomerOrdersDto } from "@refund-desk/shared";

import type { CustomerWithOrdersRecord } from "../../types/customer.types.js";

export function toCustomerOrdersDto(record: CustomerWithOrdersRecord): CustomerOrdersDto {
  return {
    customer: { id: record.id, name: record.name, email: record.email },
    orders: record.orders.map((order) => ({
      ...order,
      placedAt: order.placedAt.toISOString(),
      deliveredAt: order.deliveredAt?.toISOString() ?? null,
    })),
  };
}
