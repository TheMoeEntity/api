export const ACTIVE_REFUND_EXISTS_MESSAGE =
  "A refund for one of these items is already approved or under review";

/** An item already has an approved or pending refund (caught at write time). */
export class ActiveRefundExistsError extends Error {
  constructor() {
    super(ACTIVE_REFUND_EXISTS_MESSAGE);
    this.name = "ActiveRefundExistsError";
  }
}
