import {
  extractedClaimsSchema,
  type RefundDetailDto,
  type RefundListItemDto,
} from "@refund-desk/shared";

import type { RefundDetailRecord, RefundListRecord } from "../../types/admin.types.js";

export function toRefundListItemDto(record: RefundListRecord): RefundListItemDto {
  return {
    id: record.id,
    createdAt: record.createdAt.toISOString(),
    customerName: record.customer.name,
    orderNumber: record.order.orderNumber,
    amountCents: record.amountCents,
    verdict: record.verdict,
    status: record.status,
    reasonCategory: record.reasonCategory,
    decidingRule: record.audit?.decidingRule ?? null,
  };
}

export function toRefundDetailDto(record: RefundDetailRecord): RefundDetailDto {
  const audit = record.audit;
  // JSON columns are untyped on the way out. Validate before trusting.
  const claims = audit ? extractedClaimsSchema.safeParse(audit.extractedClaims) : null;

  return {
    id: record.id,
    createdAt: record.createdAt.toISOString(),
    customerName: record.customer.name,
    customerEmail: record.customer.email,
    orderNumber: record.order.orderNumber,
    amountCents: record.amountCents,
    verdict: record.verdict,
    status: record.status,
    reasonCategory: record.reasonCategory,
    decidingRule: audit?.decidingRule ?? null,
    message: record.message,
    customerReply: record.customerReply,
    items: record.items.map((line) => ({
      name: line.orderItem.name,
      quantity: line.quantity,
      unitPriceCents: line.orderItem.unitPriceCents,
      isFinalSale: line.orderItem.isFinalSale,
    })),
    audit: audit
      ? {
          extractedClaims: claims?.success ? claims.data : null,
          injectionSignals: audit.injectionSignals,
          rulesTriggered: audit.rulesTriggered,
          decidingRule: audit.decidingRule,
          aiProvider: audit.aiProvider,
          model: audit.model,
          promptVersion: audit.promptVersion,
          aiFallbackUsed: audit.aiFallbackUsed,
          latencyMs: audit.latencyMs,
          tokensIn: audit.tokensIn,
          tokensOut: audit.tokensOut,
        }
      : null,
    reviewActions: record.reviewActions.map((action) => ({
      id: action.id,
      decision: action.decision,
      reviewerName: action.reviewerName,
      note: action.note,
      createdAt: action.createdAt.toISOString(),
    })),
  };
}
