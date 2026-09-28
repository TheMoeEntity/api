import type { CreateRefundRequestInput, RefundDecisionDto } from "@refund-desk/shared";

import { AiGateway } from "../../ai/ai.gateway.js";
import { NEXT_STEPS } from "../../ai/templates/reply.templates.js";
import { ActiveRefundExistsError } from "../../common/errors/active-refund-exists-error.js";
import { AppError } from "../../common/errors/app-error.js";
import { DuplicateIdempotencyKeyError } from "../../common/errors/duplicate-idempotency-key-error.js";
import { daysAgo } from "../../common/utils/date.utils.js";
import { formatCents, sumLineCents } from "../../common/utils/money.utils.js";
import { sumNullable } from "../../common/utils/number.utils.js";
import { firstName } from "../../common/utils/text.utils.js";
import { evaluatePolicy } from "../../policy/policy.engine.js";
import { explainRule } from "../../policy/rule-explanations.js";
import { scanForInjection } from "../../security/injection-scanner.js";
import type { PolicyConfig } from "../../types/policy.types.js";
import type { Clock, RefundRecord, RefundRepositoryPort } from "../../types/refund.types.js";
import { resolveSelectedItems, toRefundDecisionDto } from "./refunds.helpers.js";

/**
 * The pipeline. Read submit() top to bottom and it matches the diagram:
 *   guard → facts → AI extract → policy → AI reply → audit
 */
export class RefundService {
  constructor(
    private readonly refunds: RefundRepositoryPort,
    private readonly ai: AiGateway,
    private readonly policyConfig: PolicyConfig,
    private readonly clock: Clock = () => new Date(),
  ) {}

  async submit(input: CreateRefundRequestInput): Promise<RefundDecisionDto> {
    const startedAt = Date.now();

    // 0. Idempotency: a retried submission returns the original decision.
    const existing = await this.refunds.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return this.replay(existing.customerId, input.customerId, existing);

    // 1. Facts from the database, scoped to this customer.
    const order = await this.refunds.findCustomerOrder(input.customerId, input.orderId);
    // we return 404 and not 403 because we don't want to leak the fact that an order exists to prevent account enumeration attacks.
    if (!order) throw AppError.notFound("Order not found for this customer");

    const selected = resolveSelectedItems(order.items, input.items);
    const selectedIds = selected.map(({ item }) => item.id);

    // Fast path: reject obvious duplicates before paying for AI calls.
    // Not race-proof on its own; createDecision re-checks under a lock.
    if (await this.refunds.hasActiveRefundForItems(selectedIds)) {
      throw AppError.conflict(new ActiveRefundExistsError().message);
    }

    const refundAmountCents = sumLineCents(
      selected.map(({ item, quantity }) => ({ unitPriceCents: item.unitPriceCents, quantity })),
    );
    const itemNames = selected.map(({ item }) => item.name);
    const now = this.clock();

    // 2. Deterministic injection scan (flags, never blocks).
    const injectionSignals = scanForInjection(input.message);

    // 3. AI reads the message. Failure → claims = null → policy escalates.
    const extraction = await this.ai.extractClaims({ message: input.message, itemNames });

    // 4. Code decides.
    const recentRequestCount = await this.refunds.countRecentRequests(
      input.customerId,
      daysAgo(this.policyConfig.repeatRequestWindowDays, now),
    );

    const decision = evaluatePolicy(
      {
        now,
        order: { status: order.status, deliveredAt: order.deliveredAt },
        items: selected.map(({ item, quantity }) => ({
          unitPriceCents: item.unitPriceCents,
          quantity,
          isFinalSale: item.isFinalSale,
        })),
        refundAmountCents,
        recentRequestCount,
        injectionSignals,
        claims: extraction.claims,
      },
      this.policyConfig,
    );

    // 5. AI explains the decision it was given. It cannot change it.
    const reply = await this.ai.writeReply({
      customerFirstName: firstName(order.customer.name),
      verdict: decision.verdict,
      decidingRule: decision.decidingRule,
      reasonExplanation: explainRule(decision.decidingRule, this.policyConfig),
      nextStep: NEXT_STEPS[decision.verdict],
      itemNames,
      refundAmountFormatted: formatCents(refundAmountCents),
      reasonCategory: extraction.claims?.reasonCategory ?? null,
    });

    // 6. Persist the request, its items and the audit trail atomically.
    try {
      const record = await this.refunds.createDecision({
        idempotencyKey: input.idempotencyKey,
        customerId: input.customerId,
        orderId: order.id,
        message: input.message,
        amountCents: refundAmountCents,
        reasonCategory: extraction.claims?.reasonCategory ?? null,
        verdict: decision.verdict,
        status: decision.verdict === "ESCALATED" ? "PENDING_REVIEW" : "DECIDED",
        customerReply: reply.reply,
        items: selected.map(({ item, quantity }) => ({ orderItemId: item.id, quantity })),
        audit: {
          extractedClaims: extraction.claims,
          injectionSignals,
          rulesTriggered: decision.rulesTriggered,
          decidingRule: decision.decidingRule,
          aiProvider: this.ai.providerName,
          model: reply.usage.model ?? extraction.usage.model,
          promptVersion: this.ai.promptVersion,
          aiFallbackUsed: extraction.fallbackUsed || reply.fallbackUsed,
          latencyMs: Date.now() - startedAt,
          tokensIn: sumNullable(extraction.usage.tokensIn, reply.usage.tokensIn),
          tokensOut: sumNullable(extraction.usage.tokensOut, reply.usage.tokensOut),
        },
      });
      return toRefundDecisionDto(record, false);
    } catch (err) {
      // We lost a race. First question: did an IDENTICAL submission (same key)
      // win? Then this is a retry, so return the winner's result.
      if (err instanceof DuplicateIdempotencyKeyError || err instanceof ActiveRefundExistsError) {
        const winner = await this.refunds.findByIdempotencyKey(input.idempotencyKey);
        if (winner) return this.replay(winner.customerId, input.customerId, winner);
      }
      // Otherwise a DIFFERENT submission for the same item won.
      if (err instanceof ActiveRefundExistsError) throw AppError.conflict(err.message);
      throw err;
    }
  }

  private replay(ownerId: string, requesterId: string, record: RefundRecord): RefundDecisionDto {
    // Someone reusing another customer's key must not read their result.
    if (ownerId !== requesterId) throw AppError.conflict("Idempotency key already used");
    return toRefundDecisionDto(record, true);
  }
}
