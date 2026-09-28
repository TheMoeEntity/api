import type { KeywordRule } from "../../types/ai.types.js";

/**
 * Checked in order; first match wins. Crude on purpose: the mock exists so
 * the product runs without an API key and tests run offline, not to rival
 * the model. NOT_RECEIVED comes first so "never arrived" isn't misread.
 */
export const MOCK_KEYWORD_RULES: KeywordRule[] = [
  {
    category: "NOT_RECEIVED",
    pattern: /\b(never (arrived|came|received)|not (arrived|received)|has(n'?t| not) arrived|did(n'?t| not) (arrive|receive|get)|where is my|still waiting)\b/i,
  },
  {
    category: "WRONG_ITEM",
    pattern: /\b(wrong (item|colou?r|size|product|model)|instead of|received (a|an|the) .{0,40}\binstead|not what i ordered)\b/i,
  },
  {
    category: "NOT_AS_DESCRIBED",
    pattern: /\b(not as described|doesn'?t match|different from the (picture|photo|description|listing))\b/i,
  },
  {
    category: "DAMAGED",
    pattern: /\b(damaged|broken|broke|cracked|shattered|torn|ripped|scuffed|dented|dead pixels?|peeling|stopped working|defective|faulty|not working)\b/i,
  },
  {
    category: "CHANGED_MIND",
    pattern: /\b(changed my mind|change of mind|don'?t (really )?(need|want|like)|no longer (need|want)|doesn'?t fit|too (small|big|large))\b/i,
  },
];
