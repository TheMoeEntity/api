/** An item already has an approved or pending refund (caught at write time). */
export class ActiveRefundExistsError extends Error {
  constructor() {
    super("A refund for one of these items is already approved or under review");
    this.name = "ActiveRefundExistsError";
  }
}
