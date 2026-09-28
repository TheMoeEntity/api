import { describe, expect, it } from "vitest";

import { AppError } from "../../src/common/errors/app-error.js";
import { FailingProvider, OverpromisingProvider } from "../fakes/fake-ai.providers.js";
import { buildInput } from "../helpers/build-input.js";
import { buildService } from "../helpers/build-service.js";
import { buildStore, scenarioCases } from "../helpers/build-store.js";
import type { InMemoryStore, ScenarioCase } from "../types/test.types.js";

function caseFor(store: InMemoryStore, orderNumber: string, index = 0): ScenarioCase {
  const found = scenarioCases(store).filter((c) => c.scenario.orderNumber === orderNumber)[index];
  if (!found) throw new Error(`No scenario for ${orderNumber}`);
  return found;
}

describe("RefundService", () => {
  describe("idempotency", () => {
    it("returns the original decision when the same submission is retried", async () => {
      const store = buildStore();
      const { service } = buildService(store);
      const input = buildInput(store, caseFor(store, "WN-1001"));

      const first = await service.submit(input);
      const retry = await service.submit(input);

      expect(retry.replayed).toBe(true);
      expect(retry.id).toBe(first.id);
      expect(store.refunds.filter((r) => r.idempotencyKey === input.idempotencyKey)).toHaveLength(1);
    });

    it("refuses to reveal a decision to a different customer reusing the key", async () => {
      const store = buildStore();
      const { service } = buildService(store);
      const input = buildInput(store, caseFor(store, "WN-1001"));
      await service.submit(input);

      const otherCustomer = store.customers.find((c) => c.id !== input.customerId)!;
      await expect(service.submit({ ...input, customerId: otherCustomer.id })).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  describe("double refunds", () => {
    it("blocks a second request for an item that was already approved", async () => {
      const store = buildStore();
      const { service } = buildService(store);
      const scenario = caseFor(store, "WN-1001");

      await service.submit(buildInput(store, scenario));
      const second = service.submit(buildInput(store, scenario)); // new idempotency key

      await expect(second).rejects.toBeInstanceOf(AppError);
      await expect(second).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe("concurrency", () => {
    it("two different submissions for the same item at the same time: only one wins", async () => {
      const store = buildStore();
      const { service } = buildService(store);
      const scenario = caseFor(store, "WN-1001");

      // Different idempotency keys, fired together (double-tap from two tabs).
      const results = await Promise.allSettled([
        service.submit(buildInput(store, scenario)),
        service.submit(buildInput(store, scenario)),
      ]);

      const succeeded = results.filter((r) => r.status === "fulfilled");
      const rejected = results.filter((r) => r.status === "rejected");
      expect(succeeded).toHaveLength(1);
      expect(rejected).toHaveLength(1);
      expect((rejected[0] as PromiseRejectedResult).reason).toMatchObject({ statusCode: 409 });
    });
  });

  describe("concurrency (same key)", () => {
    it("an identical submission racing itself is replayed, not rejected", async () => {
      const store = buildStore();
      const { service } = buildService(store);
      const input = buildInput(store, caseFor(store, "WN-1001"));

      const [a, b] = await Promise.all([service.submit(input), service.submit(input)]);

      expect(a.id).toBe(b.id);
      expect([a.replayed, b.replayed].sort()).toEqual([false, true]);
    });
  });

  describe("ownership", () => {
    it("treats another customer's order as not found", async () => {
      const store = buildStore();
      const { service } = buildService(store);
      const input = buildInput(store, caseFor(store, "WN-1001"));
      const intruder = store.customers.find((c) => c.id !== input.customerId)!;

      await expect(service.submit({ ...input, customerId: intruder.id })).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe("when the AI is down", () => {
    it("fails closed: a valid damaged claim is escalated, not approved", async () => {
      const store = buildStore();
      const { service, repository } = buildService(store, new FailingProvider());

      const result = await service.submit(buildInput(store, caseFor(store, "WN-1001")));

      expect(result.verdict).toBe("ESCALATED");
      expect(repository.lastDecision?.audit.decidingRule).toBe("REVIEW_UNCLEAR_REASON");
      expect(repository.lastDecision?.audit.aiFallbackUsed).toBe(true);
      expect(result.customerReply).toContain("Hi Ada");
    });

    it("still denies on facts alone (final sale needs no AI)", async () => {
      const store = buildStore();
      const { service } = buildService(store, new FailingProvider());

      const result = await service.submit(buildInput(store, caseFor(store, "WN-1002")));

      expect(result.verdict).toBe("DENIED");
    });
  });

  describe("when the AI contradicts the verdict", () => {
    it("discards the reply and uses the template", async () => {
      const store = buildStore();
      const { service, repository } = buildService(store, new OverpromisingProvider());

      const result = await service.submit(buildInput(store, caseFor(store, "WN-1002")));

      expect(result.verdict).toBe("DENIED");
      expect(result.customerReply).not.toMatch(/approved/i);
      expect(repository.lastDecision?.audit.aiFallbackUsed).toBe(true);
    });
  });

  describe("input tampering", () => {
    it("rejects an item id that isn't part of the order", async () => {
      const store = buildStore();
      const { service } = buildService(store);
      const input = buildInput(store, caseFor(store, "WN-1001"));
      const foreignItemId = store.orders.find((o) => o.id !== input.orderId)!.items[0]!.id;

      await expect(
        service.submit({ ...input, items: [{ orderItemId: foreignItemId, quantity: 1 }] }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("rejects a quantity larger than what was bought", async () => {
      const store = buildStore();
      const { service } = buildService(store);
      const input = buildInput(store, caseFor(store, "WN-1001"));

      await expect(
        service.submit({ ...input, items: [{ orderItemId: input.items[0]!.orderItemId, quantity: 5 }] }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });
});
