import type { RefundDecisionDto } from "@refund-desk/shared";

export interface ThreadEntry {
  id: string;
  customerMessage: string;
  itemNames: string[];
  decision: RefundDecisionDto;
}

export type BadgeTone = "success" | "danger" | "warning" | "neutral" | "accent";

export interface FilterOption {
  label: string;
  href: string;
  active: boolean;
}

export interface DemoHint {
  suggestedMessage: string;
  expected: string;
}
