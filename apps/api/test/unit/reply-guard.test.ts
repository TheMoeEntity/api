import { describe, expect, it } from "vitest";

import { isReplyConsistent } from "../../src/ai/reply.guard.js";

describe("isReplyConsistent", () => {
  it("rejects approval language on a denied request", () => {
    expect(isReplyConsistent("Hi Tunde, your refund has been approved!", "DENIED")).toBe(false);
  });

  it("rejects denial language on an approved request", () => {
    expect(isReplyConsistent("Hi Ada, unfortunately we are unable to offer a refund.", "APPROVED")).toBe(false);
  });

  it("rejects leaked rule codes and security wording", () => {
    expect(isReplyConsistent("Hi Femi, this was escalated due to SEC_INJECTION_SUSPECTED.", "ESCALATED")).toBe(false);
    expect(isReplyConsistent("Hi Femi, your message was flagged by our checks.", "ESCALATED")).toBe(false);
  });

  it("accepts a normal, consistent reply", () => {
    expect(
      isReplyConsistent("Hi Emeka, thanks for reaching out. A member of our team will review this shortly.", "ESCALATED"),
    ).toBe(true);
  });
});
