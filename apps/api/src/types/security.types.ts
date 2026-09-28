export type InjectionSignal =
  | "INSTRUCTION_OVERRIDE"
  | "ROLE_IMPERSONATION"
  | "PROMPT_PROBING"
  | "MARKUP_INJECTION"
  | "OUTCOME_DICTATION";

export interface InjectionPattern {
  signal: InjectionSignal;
  pattern: RegExp;
}
