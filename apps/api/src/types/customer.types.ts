import type { OrderStatus } from "@refund-desk/shared";

export interface CustomerWithOrdersRecord {
  id: string;
  name: string;
  email: string;
  orders: Array<{
    id: string;
    orderNumber: string;
    status: OrderStatus;
    placedAt: Date;
    deliveredAt: Date | null;
    items: Array<{
      id: string;
      sku: string;
      name: string;
      unitPriceCents: number;
      quantity: number;
      isFinalSale: boolean;
    }>;
  }>;
}
