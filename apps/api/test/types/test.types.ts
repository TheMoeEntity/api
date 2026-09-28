import type { SeedScenario } from "../../src/types/seed.types.js";
import type {
  CustomerOrderRecord,
  NewRefundDecision,
  RefundRecord,
} from "../../src/types/refund.types.js";

export interface StoredOrder extends CustomerOrderRecord {
  customerId: string;
  orderNumber: string;
  skuToItemId: Map<string, string>;
}

export interface StoredRefund {
  idempotencyKey: string;
  itemIds: string[];
  record: RefundRecord;
  /** Full write payload, so tests can inspect the audit trail. */
  decision: NewRefundDecision | null;
}

export interface InMemoryStore {
  customers: Array<{ id: string; name: string; email: string }>;
  orders: StoredOrder[];
  refunds: StoredRefund[];
}

export interface ScenarioCase {
  customerName: string;
  customerId: string;
  scenario: SeedScenario;
}
