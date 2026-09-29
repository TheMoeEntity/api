/** ["a"] → "a", ["a","b"] → "a and b", ["a","b","c"] → "a, b and c" */
export function joinNaturally(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}
