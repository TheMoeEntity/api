import type { RefundVerdict } from "@refund-desk/shared";

import type { ReplyInput } from "../../types/ai.types.js";
import { joinNaturally } from "../../common/utils/text.utils.js";

export const NEXT_STEPS: Record<RefundVerdict, string> = {
  APPROVED: "The refund will appear on the original payment method within 5 to 7 business days.",
  DENIED: "If you believe this is a mistake, reply to this message and our team will take another look.",
  ESCALATED: "We'll get back to you within 1 to 2 business days.",
};

/**
 * Deterministic replies. Used by the mock provider, and as the fallback
 * whenever the real model fails or writes something inconsistent.
 */
export function buildTemplateReply(input: ReplyInput): string {
  const items = joinNaturally(input.itemNames);
  const greeting = `Hi ${input.customerFirstName},`;

  switch (input.verdict) {
    case "APPROVED":
      return `${greeting} your refund of ${input.refundAmountFormatted} for the ${items} has been approved. ${input.reasonExplanation} ${input.nextStep}`;
    case "DENIED":
      return `${greeting} thank you for reaching out about the ${items}. Unfortunately we're unable to offer a refund. ${input.reasonExplanation} ${input.nextStep}`;
    case "ESCALATED":
      return `${greeting} thanks for getting in touch about the ${items}. ${input.reasonExplanation} ${input.nextStep}`;
  }
}
