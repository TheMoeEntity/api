import { ActiveRefundExistsError } from "../../common/errors/active-refund-exists-error.js";
import { DuplicateIdempotencyKeyError } from "../../common/errors/duplicate-idempotency-key-error.js";
import { isUniqueViolation } from "../../database/prisma-errors.js";
import { Prisma, type PrismaClient } from "../../generated/prisma/client.js";
import type { TransactionClient } from "../../types/database.types.js";
import type {
  CustomerOrderRecord,
  NewRefundDecision,
  RefundRecord,
  RefundRepositoryPort,
} from "../../types/refund.types.js";

const refundRecordSelect = {
  id: true,
  customerId: true,
  verdict: true,
  status: true,
  amountCents: true,
  customerReply: true,
  createdAt: true,
} satisfies Prisma.RefundRequestSelect;

export class RefundRepository implements RefundRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  findByIdempotencyKey(key: string): Promise<RefundRecord | null> {
    return this.prisma.refundRequest.findUnique({
      where: { idempotencyKey: key },
      select: refundRecordSelect,
    });
  }

  /** Scoped by customerId: you can only ever load YOUR order. */
  findCustomerOrder(customerId: string, orderId: string): Promise<CustomerOrderRecord | null> {
    return this.prisma.order.findFirst({
      where: { id: orderId, customerId },
      select: {
        id: true,
        status: true,
        deliveredAt: true,
        customer: { select: { name: true } },
        items: {
          select: { id: true, name: true, unitPriceCents: true, quantity: true, isFinalSale: true },
        },
      },
    });
  }

  countRecentRequests(customerId: string, since: Date): Promise<number> {
    return this.prisma.refundRequest.count({
      where: { customerId, createdAt: { gte: since } },
    });
  }

  hasActiveRefundForItems(orderItemIds: string[]): Promise<boolean> {
    return countActiveRefunds(this.prisma, orderItemIds).then((count) => count > 0);
  }

  /**
   * The pre-check in the service happens BEFORE the AI calls, seconds
   * earlier. Two requests for the same item can both pass it. So the check
   * is repeated here, inside a transaction, behind a row lock:
   *
   *   SELECT ... FOR UPDATE on the order row → a second transaction for the
   *   same order WAITS here until the first commits, then re-checks and
   *   sees the first one's refund.
   *
   * The lock is held for milliseconds (one count + one insert), never
   * across the slow AI calls.
   */
  async createDecision(data: NewRefundDecision): Promise<RefundRecord> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT 1 FROM "Order" WHERE "id" = ${data.orderId}::uuid FOR UPDATE`;

        const active = await countActiveRefunds(tx, data.items.map((i) => i.orderItemId));
        if (active > 0) throw new ActiveRefundExistsError();

        return tx.refundRequest.create({
          data: {
            idempotencyKey: data.idempotencyKey,
            customerId: data.customerId,
            orderId: data.orderId,
            message: data.message,
            amountCents: data.amountCents,
            reasonCategory: data.reasonCategory,
            verdict: data.verdict,
            status: data.status,
            customerReply: data.customerReply,
            items: { create: data.items },
            audit: {
              create: {
                ...data.audit,
                extractedClaims: data.audit.extractedClaims ?? Prisma.JsonNull,
              },
            },
          },
          select: refundRecordSelect,
        });
      });
    } catch (err) {
      if (isUniqueViolation(err)) throw new DuplicateIdempotencyKeyError(data.idempotencyKey);
      throw err;
    }
  }
}

/**
 * "Active" = approved, pending human review, or approved by a reviewer.
 * A DENIED refund does not block a new attempt.
 * Accepts either the client or a transaction client, so the same query
 * runs inside and outside transactions.
 */
function countActiveRefunds(db: PrismaClient | TransactionClient, orderItemIds: string[]): Promise<number> {
  return db.refundRequestItem.count({
    where: {
      orderItemId: { in: orderItemIds },
      refundRequest: {
        OR: [
          { verdict: "APPROVED" },
          { status: "PENDING_REVIEW" },
          { reviewActions: { some: { decision: "APPROVE" } } },
        ],
      },
    },
  });
}
