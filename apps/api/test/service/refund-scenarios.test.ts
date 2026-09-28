import { describe, expect, it } from "vitest";

import { buildInput } from "../helpers/build-input.js";
import { buildService } from "../helpers/build-service.js";
import { buildStore, scenarioCases } from "../helpers/build-store.js";

/**
 * Every scenario in the seed file, run through the FULL pipeline
 * (scanner → mock AI → policy engine → reply → persistence) with an
 * in-memory repository. If someone edits a rule and breaks a documented
 * scenario, this fails.
 */
describe("seed scenario matrix", () => {
  const cases = scenarioCases(buildStore());

  it.each(cases.map((c) => [`${c.customerName} · ${c.scenario.orderNumber} → ${c.scenario.expectedRule}`, c] as const))(
    "%s",
    async (_label, scenarioCase) => {
      // Fresh world per scenario so they can't affect each other.
      const store = buildStore();
      const { service, repository } = buildService(store);
      const freshCase = scenarioCases(store).find(
        (c) => c.customerName === scenarioCase.customerName && c.scenario === scenarioCase.scenario,
      )!;

      const result = await service.submit(buildInput(store, freshCase));

      expect(result.verdict).toBe(scenarioCase.scenario.expectedVerdict);
      expect(repository.lastDecision?.audit.decidingRule).toBe(scenarioCase.scenario.expectedRule);
      expect(result.customerReply.length).toBeGreaterThan(20);
    },
  );
});
