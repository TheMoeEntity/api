import type { ExtractedClaims } from "@refund-desk/shared";

import { MockProvider } from "../../src/ai/providers/mock.provider.js";
import type { AiCallResult, AiProvider, ReplyInput } from "../../src/types/ai.types.js";

/** Simulates the AI being down (timeout, 500, bad key...). */
export class FailingProvider implements AiProvider {
  readonly name = "claude" as const;
  readonly promptVersion = "test";

  async extractClaims(): Promise<AiCallResult<ExtractedClaims>> {
    throw new Error("503 Service Unavailable");
  }

  async writeReply(): Promise<AiCallResult<string>> {
    throw new Error("503 Service Unavailable");
  }
}

/** Extracts correctly, but writes a reply that contradicts the verdict. */
export class OverpromisingProvider implements AiProvider {
  readonly name = "claude" as const;
  readonly promptVersion = "test";
  private readonly mock = new MockProvider();

  extractClaims(...args: Parameters<MockProvider["extractClaims"]>): Promise<AiCallResult<ExtractedClaims>> {
    return this.mock.extractClaims(...args);
  }

  async writeReply(_input: ReplyInput): Promise<AiCallResult<string>> {
    return {
      data: "Great news! Your refund has been approved and will be processed today.",
      usage: { model: "fake", tokensIn: 10, tokensOut: 10 },
    };
  }
}
