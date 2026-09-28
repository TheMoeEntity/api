import type { InjectionSignal } from "../types/security.types.js";
import { INJECTION_PATTERNS } from "./injection-patterns.js";
import { normalizeForScanning } from "./text-normalizer.js";

/** Returns every distinct signal found. Empty array = nothing suspicious. */
export function scanForInjection(message: string): InjectionSignal[] {
  const text = normalizeForScanning(message);
  const found = new Set<InjectionSignal>();

  for (const { signal, pattern } of INJECTION_PATTERNS) {
    if (pattern.test(text)) found.add(signal);
  }

  return [...found];
}
