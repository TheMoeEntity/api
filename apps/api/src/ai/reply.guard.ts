import type { RefundVerdict } from "@refund-desk/shared";

/**
 * Output validation. The model is instructed not to contradict the
 * verdict, but instructions are not guarantees, so we check.
 * Any failure → the gateway uses the template instead.
 */
const APPROVAL_LANGUAGE = /\b(has been approved|is approved|we('| ha)ve (approved|refunded)|refund (has been|is being|will be) (issued|processed|sent))\b/i;
const DENIAL_LANGUAGE = /\b(denied|declined|not eligible|unable to (offer|approve|refund)|can(no|')t (offer|approve|refund))\b/i;
// Case-sensitive on purpose: rule codes are SHOUTY_SNAKE_CASE.
const RULE_CODE = /\b[A-Z]{2,}_[A-Z_]{3,}\b/;
const INTERNAL_WORDS = /\b(inject\w*|flagged|manipulat\w*|system prompt|policy engine)\b/i;

export function isReplyConsistent(reply: string, verdict: RefundVerdict): boolean {
  const text = reply.trim();
  if (text.length < 20 || text.length > 1200) return false;
  if (RULE_CODE.test(text) || INTERNAL_WORDS.test(text)) return false;
  if (verdict !== "APPROVED" && APPROVAL_LANGUAGE.test(text)) return false;
  if (verdict === "APPROVED" && DENIAL_LANGUAGE.test(text)) return false;
  return true;
}
