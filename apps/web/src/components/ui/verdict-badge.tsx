import type { VerdictBadgeProps } from "@/types/component.types";
import { VERDICT_LABEL, VERDICT_TONE } from "@/lib/labels";

import { Badge } from "./badge";

export function VerdictBadge({ verdict }: VerdictBadgeProps) {
  return <Badge tone={VERDICT_TONE[verdict]}>{VERDICT_LABEL[verdict]}</Badge>;
}
