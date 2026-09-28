import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client.js";

/**
 * Prisma 7 talks to Postgres through a driver adapter (node-postgres here)
 * instead of the old bundled Rust query engine.
 *
 * This is a factory, not a module-level singleton: the composition root
 * decides when a client is created, and tests can build their own.
 */
export function createPrismaClient(connectionString: string): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}
