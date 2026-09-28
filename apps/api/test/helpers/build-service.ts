import { pino } from "pino";

import { AiGateway } from "../../src/ai/ai.gateway.js";
import { MockProvider } from "../../src/ai/providers/mock.provider.js";
import { RefundService } from "../../src/modules/refunds/refunds.service.js";
import { defaultPolicyConfig } from "../../src/policy/policy.config.js";
import type { AiProvider } from "../../src/types/ai.types.js";
import { FakeRefundRepository } from "../fakes/fake-refund.repository.js";
import type { InMemoryStore } from "../types/test.types.js";
import { TEST_NOW } from "./build-store.js";

/** A mini composition root for tests: same wiring as index.ts, fake parts. */
export function buildService(store: InMemoryStore, provider: AiProvider = new MockProvider()) {
  const clock = () => TEST_NOW;
  const repository = new FakeRefundRepository(store, clock);
  const gateway = new AiGateway(provider, pino({ level: "silent" }));
  const service = new RefundService(repository, gateway, defaultPolicyConfig, clock);
  return { service, repository };
}
