import type Anthropic from "@anthropic-ai/sdk";
import { extractedClaimsSchema, type ExtractedClaims } from "@refund-desk/shared";
import { z } from "zod";

import { AiResponseError } from "../../common/errors/ai-response-error.js";
import type {
  AiCallResult,
  AiProvider,
  AiUsage,
  ClaimExtractionInput,
  ReplyInput,
} from "../../types/ai.types.js";
import {
  buildExtractorUserMessage,
  EXTRACTOR_SYSTEM_PROMPT,
  RECORD_CLAIMS_TOOL_NAME,
} from "../prompts/extractor.prompt.js";
import { PROMPT_VERSION } from "../prompts/prompt-version.js";
import { buildResponderUserMessage, RESPONDER_SYSTEM_PROMPT } from "../prompts/responder.prompt.js";

/**
 * The tool definition is generated from the same Zod schema we validate
 * the response with. Ask for exactly what you check for.
 */
function buildRecordClaimsTool(): Anthropic.Messages.Tool {
  const { properties, required } = z.toJSONSchema(extractedClaimsSchema) as {
    properties: Record<string, unknown>;
    required: string[];
  };

  return {
    name: RECORD_CLAIMS_TOOL_NAME,
    description: "Record the structured claims extracted from a customer's refund message.",
    input_schema: { type: "object", properties, required },
  };
}

export class ClaudeProvider implements AiProvider {
  readonly name = "claude" as const;
  readonly promptVersion = PROMPT_VERSION;
  private readonly recordClaimsTool = buildRecordClaimsTool();

  constructor(
    private readonly client: Anthropic,
    private readonly model: string,
  ) {}

  async extractClaims(input: ClaimExtractionInput): Promise<AiCallResult<ExtractedClaims>> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 400,
      system: EXTRACTOR_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildExtractorUserMessage(input) }],
      tools: [this.recordClaimsTool],
      // Forced tool use: the model MUST answer through the schema, never free text.
      tool_choice: { type: "tool", name: RECORD_CLAIMS_TOOL_NAME },
    });

    const toolCall = response.content.find(
      (block): block is Anthropic.Messages.ToolUseBlock => block.type === "tool_use",
    );
    if (!toolCall) throw new AiResponseError("Model did not call the extraction tool");

    // Never trust model output just because we asked nicely. Validate it.
    const parsed = extractedClaimsSchema.safeParse(toolCall.input);
    if (!parsed.success) {
      throw new AiResponseError("Extraction failed schema validation", z.flattenError(parsed.error));
    }

    return { data: parsed.data, usage: this.toUsage(response) };
  }

  async writeReply(input: ReplyInput): Promise<AiCallResult<string>> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 300,
      system: RESPONDER_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildResponderUserMessage(input) }],
    });

    const text = response.content
      .filter((block): block is Anthropic.Messages.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    if (!text) throw new AiResponseError("Model returned an empty reply");

    return { data: text, usage: this.toUsage(response) };
  }

  private toUsage(response: Anthropic.Messages.Message): AiUsage {
    return {
      model: response.model,
      tokensIn: response.usage.input_tokens,
      tokensOut: response.usage.output_tokens,
    };
  }
}
