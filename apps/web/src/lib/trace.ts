import type { DecisionAuditDto } from "@refund-desk/shared";

/** Plain-English account of who wrote the customer's reply, from the audit row. */
export function describeReplySource(audit: DecisionAuditDto): string {
  if (audit.aiProvider === "mock") return "Template reply (mock AI provider, no API key configured)";
  if (audit.extractedClaims === null) return "AI unavailable, so the reason was unknown and a template reply was used";
  if (audit.aiFallbackUsed) return "AI reply failed the consistency check, so a template was used instead";
  return `Written by ${audit.model ?? "the model"} and passed the consistency check`;
}
