import type { BadgeProps } from "@/types/component.types";
import type { BadgeTone } from "@/types/ui.types";

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  danger: "bg-red-50 text-red-800 ring-red-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  accent: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  neutral: "bg-stone-100 text-stone-700 ring-stone-200",
};

export function Badge({ tone, children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}
