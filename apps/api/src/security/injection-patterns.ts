import type { InjectionPattern } from "../types/security.types.js";

/**
 * Heuristics, not a wall. They catch the lazy 80% of attempts cheaply and
 * predictably. The model's own `manipulationAttempt` flag and the fact that
 * the model never holds decision power cover the rest.
 *
 * Deliberately NOT here: "please approve my refund". Real customers say
 * that constantly; flagging it would escalate honest people.
 */
export const INJECTION_PATTERNS: InjectionPattern[] = [
  {
    signal: "INSTRUCTION_OVERRIDE",
    pattern: /\b(ignore|disregard|forget|override|bypass)\b.{0,40}\b(instructions?|rules?|polic(y|ies)|prompts?|guidelines?)\b/,
  },
  {
    signal: "ROLE_IMPERSONATION",
    pattern: /\b(you are now|act as|pretend (to be|you are)|(admin|developer|debug|god|dan) mode|i am (an? )?(admin|administrator|manager|staff|developer))\b/,
  },
  {
    signal: "PROMPT_PROBING",
    pattern: /\b(system prompt|your instructions|initial prompt|reveal (your|the) (prompt|rules))\b/,
  },
  {
    signal: "MARKUP_INJECTION",
    pattern: /<\/?\s*(system|assistant|user|instructions?|customer_message)\b|\[\/?(system|inst)\]|```/,
  },
  {
    signal: "OUTCOME_DICTATION",
    // Telling the system what its verdict must be, with an amount or authority claim.
    pattern: /\b(approve|refund|transfer|send)\b.{0,30}(immediately|right now|full refund of|\$\s?\d{3,})/,
  },
];
