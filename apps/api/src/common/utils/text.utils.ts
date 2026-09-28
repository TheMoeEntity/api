/** ["a"] → "a", ["a","b"] → "a and b", ["a","b","c"] → "a, b and c" */
export function joinNaturally(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/** First word of a full name, for friendly greetings. */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

/**
 * Neutralise angle brackets so untrusted text can't close our prompt
 * delimiters (e.g. a message containing "</customer_message>").
 */
export function escapeForPromptTag(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
