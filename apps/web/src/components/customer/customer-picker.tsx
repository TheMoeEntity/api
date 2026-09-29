"use client";

import { useRouter } from "next/navigation";

import type { CustomerPickerProps } from "@/types/component.types";

/**
 * Demo-only persona switch. In production the customer comes from their
 * login session, never from a dropdown.
 */
export function CustomerPicker({ customers, selectedId }: CustomerPickerProps) {
  const router = useRouter();

  return (
    <label className="block">
      <span className="text-xs font-medium text-stone-500">Signed in as (demo)</span>
      <select
        className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-indigo-500 focus:outline-none"
        value={selectedId ?? ""}
        onChange={(e) => router.push(e.target.value ? `/?customer=${e.target.value}` : "/")}
      >
        <option value="">Choose a customer…</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} · {c.email}
          </option>
        ))}
      </select>
    </label>
  );
}
