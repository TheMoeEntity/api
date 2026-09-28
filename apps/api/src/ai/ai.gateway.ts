import type { Logger } from "pino";

import type {
  AiProvider,
  AiProviderName,
  AiUsage,
  ClaimExtractionInput,
  ExtractionOutcome,
  ReplyInput,
  ReplyOutcome,
} from "../types/ai.types.js";
import { isReplyConsistent } from "./reply.guard.js";
import { buildTemplateReply } from "./templates/reply.templates.js";

const NO_USAGE: AiUsage = { model: null, tokensIn: null, tokensOut: null };

/**
 * Treat the LLM like any unreliable external dependency (think NIBSS in a
 * disbursement flow): it can be slow, down, or return garbage. This class
 * absorbs all of that so the service above it never has to know.
 *
 *   extraction fails → claims = null → policy escalates to a human (fail closed)
 *   reply fails or contradicts the verdict → deterministic template
 *
 * The SDK client already handles timeouts and one retry with backoff.
 */
export class AiGateway {
  constructor(
    private readonly provider: AiProvider,
    private readonly logger: Logger,
  ) {}

  get providerName(): AiProviderName {
    return this.provider.name;
  }

  get promptVersion(): string {
    return this.provider.promptVersion;
  }

  async extractClaims(input: ClaimExtractionInput): Promise<ExtractionOutcome> {
    try {
      const result = await this.provider.extractClaims(input);
      return { claims: result.data, usage: result.usage, fallbackUsed: false };
    } catch (err) {
      this.logger.warn({ err, provider: this.provider.name }, "Claim extraction failed, failing closed");
      return { claims: null, usage: NO_USAGE, fallbackUsed: true };
    }
  }

  async writeReply(input: ReplyInput): Promise<ReplyOutcome> {
    try {
      const result = await this.provider.writeReply(input);

      if (isReplyConsistent(result.data, input.verdict)) {
        return { reply: result.data.trim(), usage: result.usage, fallbackUsed: false };
      }

      this.logger.warn({ verdict: input.verdict }, "Model reply failed consistency check, using template");
      return { reply: buildTemplateReply(input), usage: result.usage, fallbackUsed: true };
    } catch (err) {
      this.logger.warn({ err, provider: this.provider.name }, "Reply generation failed, using template");
      return { reply: buildTemplateReply(input), usage: NO_USAGE, fallbackUsed: true };
    }
  }
}
