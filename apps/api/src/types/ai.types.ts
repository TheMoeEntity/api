import type {
  ExtractedClaims,
  PolicyRuleCode,
  ReasonCategory,
  RefundVerdict,
} from "@refund-desk/shared";

export type AiProviderName = "claude" | "mock";

export interface AiUsage {
  model: string | null;
  tokensIn: number | null;
  tokensOut: number | null;
}

export interface AiCallResult<T> {
  data: T;
  usage: AiUsage;
}

export interface ClaimExtractionInput {
  message: string;
  /** Names of the items the customer selected (facts from our DB). */
  itemNames: string[];
}

/**
 * Note what's missing: the customer's original message. The responder
 * only sees our facts and the decision, so injected text in the message
 * has no path into the reply. See the README trade-offs section.
 */
export interface ReplyInput {
  customerFirstName: string;
  verdict: RefundVerdict;
  decidingRule: PolicyRuleCode;
  reasonExplanation: string;
  nextStep: string;
  itemNames: string[];
  refundAmountFormatted: string;
  reasonCategory: ReasonCategory | null;
}

/** The contract every AI backend must satisfy. */
export interface AiProvider {
  readonly name: AiProviderName;
  readonly promptVersion: string;
  extractClaims(input: ClaimExtractionInput): Promise<AiCallResult<ExtractedClaims>>;
  writeReply(input: ReplyInput): Promise<AiCallResult<string>>;
}

export interface ExtractionOutcome {
  claims: ExtractedClaims | null;
  usage: AiUsage;
  fallbackUsed: boolean;
}

export interface ReplyOutcome {
  reply: string;
  usage: AiUsage;
  fallbackUsed: boolean;
}

export interface KeywordRule {
  category: ReasonCategory;
  pattern: RegExp;
}
