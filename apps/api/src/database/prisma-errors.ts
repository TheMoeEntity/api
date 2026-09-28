import { Prisma } from "../generated/prisma/client.js";

/** P2002 = unique constraint violation. */
export function isUniqueViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}
