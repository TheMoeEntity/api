import "dotenv/config";

import { randomUUID } from "node:crypto";

import { daysAgo } from "../src/common/utils/date.utils.js";
import { sumLineCents } from "../src/common/utils/money.utils.js";
import { createPrismaClient } from "../src/database/prisma.js";
import type { TransactionClient } from "../src/types/database.types.js";
import type { SeedCustomer } from "../src/types/seed.types.js";
import { seedCustomers } from "./seed-data/customers.seed.js";

/**
 * Seeds run on every container start, so they must be idempotent:
 * running twice must not create duplicates. The simplest correct approach
 * is a guard: if customers exist, do nothing. To reseed from scratch,
 * run `pnpm db:reset`.
 *
 * Everything is written in ONE transaction, so a crash halfway through
 * can't leave a half-seeded database that the guard then skips forever.
 */
async function seedCustomer(tx: TransactionClient, data: SeedCustomer, now: Date): Promise<void> {
  const customer = await tx.customer.create({
    data: { name: data.name, email: data.email, createdAt: daysAgo(120, now) },
  });

  for (const order of data.orders) {
    await tx.order.create({
      data: {
        orderNumber: order.orderNumber,
        customerId: customer.id,
        status: order.status,
        placedAt: daysAgo(order.placedDaysAgo, now),
        deliveredAt: order.deliveredDaysAgo === null ? null : daysAgo(order.deliveredDaysAgo, now),
        items: {
          create: order.items.map((item) => ({
            sku: item.sku,
            name: item.name,
            unitPriceCents: item.unitPriceCents,
            quantity: item.quantity,
            isFinalSale: item.isFinalSale ?? false,
          })),
        },
      },
    });
  }

  for (const prior of data.priorRefunds ?? []) {
    const order = await tx.order.findUniqueOrThrow({
      where: { orderNumber: prior.orderNumber },
      include: { items: true },
    });

    const createdAt = daysAgo(prior.daysAgo, now);

    await tx.refundRequest.create({
      data: {
        idempotencyKey: randomUUID(),
        customerId: customer.id,
        orderId: order.id,
        message: prior.message,
        amountCents: sumLineCents(order.items),
        reasonCategory: prior.reasonCategory,
        verdict: prior.verdict,
        status: "DECIDED",
        customerReply: "Your refund has been approved and will be processed within 5 business days.",
        createdAt,
        items: {
          create: order.items.map((item) => ({ orderItemId: item.id, quantity: item.quantity })),
        },
      },
    });
  }
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required to seed");

  const prisma = createPrismaClient(databaseUrl);

  try {
    const existing = await prisma.customer.count();
    if (existing > 0) {
      console.log(`Seed skipped: ${existing} customers already exist.`);
      return;
    }

    // One "now" for the whole run, so every relative date lines up.
    const now = new Date();

    await prisma.$transaction(
      async (tx) => {
        for (const customer of seedCustomers) {
          await seedCustomer(tx, customer, now);
        }
      },
      { timeout: 30_000 },
    );

    const orderCount = seedCustomers.reduce((n, c) => n + c.orders.length, 0);
    console.log(`Seeded ${seedCustomers.length} customers and ${orderCount} orders.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
