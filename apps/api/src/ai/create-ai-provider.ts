import Anthropic from "@anthropic-ai/sdk";

import type { AiProvider } from "../types/ai.types.js";
import type { Env } from "../types/env.types.js";
import { ClaudeProvider } from "./providers/claude.provider.js";
import { MockProvider } from "./providers/mock.provider.js";

/** The one place that decides which AI backend runs. */
export function createAiProvider(env: Env): AiProvider {
  if (!env.ANTHROPIC_API_KEY) return new MockProvider();

  const client = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    timeout: env.AI_TIMEOUT_MS,
    // One retry with backoff on 429/5xx/timeouts. More would make a
    // customer wait too long; the gateway's fallback handles the rest.
    maxRetries: 1,
  });

  return new ClaudeProvider(client, env.ANTHROPIC_MODEL);
}
