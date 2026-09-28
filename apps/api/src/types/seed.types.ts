import type {
  OrderStatus,
  ReasonCategory,
  RefundVerdict,
} from "@refund-desk/shared";

export interface SeedOrderItem {
  sku: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  isFinalSale?: boolean;
}

/**
 * Dates are expressed as "days ago", not fixed timestamps.
 * A fixed date like 2026-09-20 makes "delivered 5 days ago" false by the
 * time a reviewer runs the project next week, and every window-based
 * scenario silently changes outcome. Relative dates keep the matrix true.
 */
export interface SeedOrder {
  orderNumber: string;
  status: OrderStatus;
  placedDaysAgo: number;
  deliveredDaysAgo: number | null;
  items: SeedOrderItem[];
}

/** A historical refund, used to exercise the repeat-requester rule. */
export interface SeedPriorRefund {
  orderNumber: string;
  daysAgo: number;
  reasonCategory: ReasonCategory;
  verdict: RefundVerdict;
  message: string;
}

/** One scenario the reviewer can try from the customer UI. */
export interface SeedScenario {
  orderNumber: string;
  /** Which items to select (by SKU) in the UI. */
  selectSkus: string[];
  sampleMessage: string;
  expectedVerdict: RefundVerdict;
  expectedRule: string;
}

export interface SeedCustomer {
  name: string;
  email: string;
  orders: SeedOrder[];
  priorRefunds?: SeedPriorRefund[];
  /** Documentation + eval fixtures only; not written to the database. */
  scenarios: SeedScenario[];
}
