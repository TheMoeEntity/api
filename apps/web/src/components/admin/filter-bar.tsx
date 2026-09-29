import Link from "next/link";

import type { FilterBarProps } from "@/types/component.types";

export function FilterBar({ options }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Link
          key={option.label}
          href={option.href}
          className={`rounded-lg border px-3 py-1.5 text-sm ${
            option.active ? "border-indigo-500 bg-indigo-50 text-indigo-800" : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
          }`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
