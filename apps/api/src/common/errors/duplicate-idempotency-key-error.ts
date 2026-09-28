/** Two identical submissions raced; the database's unique index caught it. */
export class DuplicateIdempotencyKeyError extends Error {
  constructor(public readonly idempotencyKey: string) {
    super(`Refund request with idempotency key ${idempotencyKey} already exists`);
    this.name = "DuplicateIdempotencyKeyError";
  }
}
