import type { Prisma } from "../generated/prisma/client.js";

/**
 * The client handed to you inside `prisma.$transaction(async (tx) => ...)`.
 * Repositories will accept this so a service can run several repository
 * calls inside one transaction.
 */
export type TransactionClient = Prisma.TransactionClient;
