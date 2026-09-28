/** Adds two nullable numbers; null only if BOTH are null. */
export function sumNullable(a: number | null, b: number | null): number | null {
  return a === null && b === null ? null : (a ?? 0) + (b ?? 0);
}
