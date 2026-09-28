import { randomUUID } from "node:crypto";

import type { CreateRefundRequestInput } from "@refund-desk/shared";

import type { InMemoryStore, ScenarioCase } from "../types/test.types.js";
import { findOrder } from "./build-store.js";

export function buildInput(
  store: InMemoryStore,
  { customerId, scenario }: ScenarioCase,
  overrides: Partial<CreateRefundRequestInput> = {},
): CreateRefundRequestInput {
  const order = findOrder(store, scenario.orderNumber);

  return {
    idempotencyKey: randomUUID(),
    customerId,
    orderId: order.id,
    message: scenario.sampleMessage,
    items: scenario.selectSkus.map((sku) => {
      const itemId = order.skuToItemId.get(sku);
      const item = order.items.find((i) => i.id === itemId);
      if (!itemId || !item) throw new Error(`Unknown SKU ${sku}`);
      return { orderItemId: itemId, quantity: item.quantity };
    }),
    ...overrides,
  };
}
