/** The model answered, but not in a shape we can trust. */
export class AiResponseError extends Error {
  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = "AiResponseError";
  }
}
