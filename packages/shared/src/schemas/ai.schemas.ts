import { z } from "zod";

import { REASON_CATEGORIES } from "../constants/refund.constants.js";

/**
 * What the AI extractor must return. Used twice:
 * 1. Converted to JSON Schema and given to Claude as the tool definition.
 * 2. Used to validate what Claude actually sent back.
 * One schema, so the contract we ask for and the contract we check can't drift.
 */
export const extractedClaimsSchema = z.object({
  reasonCategory: z.enum(REASON_CATEGORIES),
  summary: z.string().trim().min(1).max(300),
  manipulationAttempt: z.boolean(),
});
