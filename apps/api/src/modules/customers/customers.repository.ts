import type { CustomerSummaryDto } from "@refund-desk/shared";

import type { PrismaClient } from "../../generated/prisma/client.js";
import type { CustomerWithOrdersRecord } from "../../types/customer.types.js";

export class CustomerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  listCustomers(): Promise<CustomerSummaryDto[]> {
    return this.prisma.customer.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
  }

  findWithOrders(customerId: string): Promise<CustomerWithOrdersRecord | null> {
    return this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        email: true,
        orders: {
          orderBy: { placedAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            placedAt: true,
            deliveredAt: true,
            items: {
              orderBy: { name: "asc" },
              select: {
                id: true,
                sku: true,
                name: true,
                unitPriceCents: true,
                quantity: true,
                isFinalSale: true,
              },
            },
          },
        },
      },
    });
  }
}
