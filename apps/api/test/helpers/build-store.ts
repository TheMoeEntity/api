import { randomUUID } from "node:crypto";

import { seedCustomers } from "../../prisma/seed-data/customers.seed.js";
import { daysAgo } from "../../src/common/utils/date.utils.js";
import { sumLineCents } from "../../src/common/utils/money.utils.js";
import type { InMemoryStore, ScenarioCase, StoredOrder } from "../types/test.types.js";

/** A fixed "now" so every relative date is deterministic. */
export const TEST_NOW = new Date("2026-09-27T12:00:00.000Z");

/** Builds the same world the real seed creates, but in memory. */
export function buildStore(now: Date = TEST_NOW): InMemoryStore {
  const store: InMemoryStore = { customers: [], orders: [], refunds: [] };

  for (const seed of seedCustomers) {
    const customerId = randomUUID();
    store.customers.push({ id: customerId, name: seed.name, email: seed.email });

    for (const order of seed.orders) {
      const skuToItemId = new Map<string, string>();
      const stored: StoredOrder = {
        id: randomUUID(),
        customerId,
        orderNumber: order.orderNumber,
        status: order.status,
        deliveredAt: order.deliveredDaysAgo === null ? null : daysAgo(order.deliveredDaysAgo, now),
        customer: { name: seed.name },
        skuToItemId,
        items: order.items.map((item) => {
          const id = randomUUID();
          skuToItemId.set(item.sku, id);
          return {
            id,
            name: item.name,
            unitPriceCents: item.unitPriceCents,
            quantity: item.quantity,
            isFinalSale: item.isFinalSale ?? false,
          };
        }),
      };
      store.orders.push(stored);
    }

    for (const prior of seed.priorRefunds ?? []) {
      const order = findOrder(store, prior.orderNumber);
      store.refunds.push({
        idempotencyKey: randomUUID(),
        itemIds: order.items.map((item) => item.id),
        decision: null,
        record: {
          id: randomUUID(),
          customerId,
          verdict: prior.verdict,
          status: "DECIDED",
          amountCents: sumLineCents(order.items),
          customerReply: "",
          createdAt: daysAgo(prior.daysAgo, now),
        },
      });
    }
  }

  return store;
}

export function findOrder(store: InMemoryStore, orderNumber: string): StoredOrder {
  const order = store.orders.find((o) => o.orderNumber === orderNumber);
  if (!order) throw new Error(`Unknown order ${orderNumber}`);
  return order;
}

/** Every scenario from the seed file, flattened, with ids resolved. */
export function scenarioCases(store: InMemoryStore): ScenarioCase[] {
  return seedCustomers.flatMap((seed) => {
    const customer = store.customers.find((c) => c.email === seed.email);
    if (!customer) throw new Error(`Unknown customer ${seed.email}`);
    return seed.scenarios.map((scenario) => ({
      customerName: seed.name,
      customerId: customer.id,
      scenario,
    }));
  });
}
