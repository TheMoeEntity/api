import type {
  ExtractedClaims,
  OrderStatus,
  PolicyRuleCode,
  ReasonCategory,
  RefundStatus,
  RefundVerdict,
} from "@refund-desk/shared";

export interface OrderItemRecord {
  id: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  isFinalSale: boolean;
}

export interface CustomerOrderRecord {
  id: string;
  status: OrderStatus;
  deliveredAt: Date | null;
  customer: { name: string };
  items: OrderItemRecord[];
}

export interface RefundRecord {
  id: string;
  customerId: string;
  verdict: RefundVerdict;
  status: RefundStatus;
  amountCents: number;
  customerReply: string;
  createdAt: Date;
}

export interface SelectedItem {
  item: OrderItemRecord;
  quantity: number;
}

export interface NewRefundDecision {
  idempotencyKey: string;
  customerId: string;
  orderId: string;
  message: string;
  amountCents: number;
  reasonCategory: ReasonCategory | null;
  verdict: RefundVerdict;
  status: RefundStatus;
  customerReply: string;
  items: Array<{ orderItemId: string; quantity: number }>;
  audit: {
    extractedClaims: ExtractedClaims | null;
    injectionSignals: string[];
    rulesTriggered: PolicyRuleCode[];
    decidingRule: PolicyRuleCode;
    aiProvider: string;
    model: string | null;
    promptVersion: string;
    aiFallbackUsed: boolean;
    latencyMs: number;
    tokensIn: number | null;
    tokensOut: number | null;
  };
}

/**
 * The PORT: what RefundService needs from storage, described as an
 * interface. RefundRepository (Prisma) implements it in production;
 * an in-memory fake implements it in tests. The service can't tell.
 */
export interface RefundRepositoryPort {
  findByIdempotencyKey(key: string): Promise<RefundRecord | null>;
  findCustomerOrder(customerId: string, orderId: string): Promise<CustomerOrderRecord | null>;
  countRecentRequests(customerId: string, since: Date): Promise<number>;
  /** Fast pre-check (no lock). True if any item has an approved or pending refund. */
  hasActiveRefundForItems(orderItemIds: string[]): Promise<boolean>;
  /**
   * Atomically re-checks for active refunds and writes the decision.
   * Throws ActiveRefundExistsError if another request got there first,
   * or DuplicateIdempotencyKeyError if the key was taken concurrently.
   */
  createDecision(data: NewRefundDecision): Promise<RefundRecord>;
}

/** Time source as a dependency, so tests can freeze "now". */
export type Clock = () => Date;
