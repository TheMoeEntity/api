import type { PrismaClient } from "../../generated/prisma/client.js";

export class HealthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async pingDatabase(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`;
  }
}
