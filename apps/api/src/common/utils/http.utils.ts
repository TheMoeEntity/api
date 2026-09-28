/** express.json() tags body-parse failures with this type. */
export function isJsonParseError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    (err as { type: unknown }).type === "entity.parse.failed"
  );
}
