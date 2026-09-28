import { randomUUID } from "node:crypto";

import { ActiveRefundExistsError } from "../../src/common/errors/active-refund-exists-error.js";
import { DuplicateIdempotencyKeyError } from "../../src/common/errors/duplicate-idempotency-key-error.js";
import type {
  CustomerOrderRecord,
  NewRefundDecision,
  RefundRecord,
  RefundRepositoryPort,
} from "../../src/types/refund.types.js";
import type { InMemoryStore, StoredRefund } from "../types/test.types.js";

/** Same contract as RefundRepository, backed by arrays instead of Postgres. */
export class FakeRefundRepository implements RefundRepositoryPort {
  constructor(
    private readonly store: InMemoryStore,
    private readonly now: () => Date,
  ) {}

  get lastDecision(): NewRefundDecision | null {
    return this.store.refunds.at(-1)?.decision ?? null;
  }

  async findByIdempotencyKey(key: string): Promise<RefundRecord | null> {
    return this.store.refunds.find((r) => r.idempotencyKey === key)?.record ?? null;
  }

  async findCustomerOrder(customerId: string, orderId: string): Promise<CustomerOrderRecord | null> {
    return this.store.orders.find((o) => o.id === orderId && o.customerId === customerId) ?? null;
  }

  async countRecentRequests(customerId: string, since: Date): Promise<number> {
    return this.store.refunds.filter(
      (r) => r.record.customerId === customerId && r.record.createdAt >= since,
    ).length;
  }

  async hasActiveRefundForItems(orderItemIds: string[]): Promise<boolean> {
    return this.isActive(orderItemIds);
  }

  private isActive(orderItemIds: string[]): boolean {
    return this.store.refunds.some(
      (r) =>
        r.itemIds.some((id) => orderItemIds.includes(id)) &&
        (r.record.verdict === "APPROVED" || r.record.status === "PENDING_REVIEW"),
    );
  }

  /**
   * JavaScript runs this synchronous block without interruption, which
   * plays the role of the database lock + unique index in the real one.
   */
  async createDecision(data: NewRefundDecision): Promise<RefundRecord> {
    if (this.store.refunds.some((r) => r.idempotencyKey === data.idempotencyKey)) {
      throw new DuplicateIdempotencyKeyError(data.idempotencyKey);
    }
    if (this.isActive(data.items.map((i) => i.orderItemId))) {
      throw new ActiveRefundExistsError();
    }

    const stored: StoredRefund = {
      idempotencyKey: data.idempotencyKey,
      itemIds: data.items.map((i) => i.orderItemId),
      decision: data,
      record: {
        id: randomUUID(),
        customerId: data.customerId,
        verdict: data.verdict,
        status: data.status,
        amountCents: data.amountCents,
        customerReply: data.customerReply,
        createdAt: this.now(),
      },
    };
    this.store.refunds.push(stored);
    return stored.record;
  }
}
