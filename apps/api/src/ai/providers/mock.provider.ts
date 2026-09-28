import type { ExtractedClaims } from "@refund-desk/shared";

import { scanForInjection } from "../../security/injection-scanner.js";
import type {
  AiCallResult,
  AiProvider,
  AiUsage,
  ClaimExtractionInput,
  ReplyInput,
} from "../../types/ai.types.js";
import { PROMPT_VERSION } from "../prompts/prompt-version.js";
import { buildTemplateReply } from "../templates/reply.templates.js";
import { MOCK_KEYWORD_RULES } from "./mock-keywords.js";

const MOCK_USAGE: AiUsage = { model: null, tokensIn: null, tokensOut: null };

/**
 * Deterministic stand-in for the LLM. Used when no API key is configured,
 * and in tests. Same interface as ClaudeProvider, so the rest of the
 * system cannot tell the difference: that's the point of the interface.
 */
export class MockProvider implements AiProvider {
  readonly name = "mock" as const;
  readonly promptVersion = PROMPT_VERSION;

  async extractClaims(input: ClaimExtractionInput): Promise<AiCallResult<ExtractedClaims>> {
    const match = MOCK_KEYWORD_RULES.find((rule) => rule.pattern.test(input.message));

    return {
      data: {
        reasonCategory: match?.category ?? "OTHER",
        summary: `Customer reports: ${match?.category.toLowerCase().replaceAll("_", " ") ?? "unclear reason"}.`,
        manipulationAttempt: scanForInjection(input.message).length > 0,
      },
      usage: MOCK_USAGE,
    };
  }

  async writeReply(input: ReplyInput): Promise<AiCallResult<string>> {
    return { data: buildTemplateReply(input), usage: MOCK_USAGE };
  }
}
