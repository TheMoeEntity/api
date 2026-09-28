import type { MoneyLine } from "../../types/money.types.js";

/** Sum of unit price × quantity, in integer cents. */
export function sumLineCents(lines: MoneyLine[]): number {
  return lines.reduce((total, line) => total + line.unitPriceCents * line.quantity, 0);
}

/** 50000 → "$500.00". Display only; never parse this back into money. */
export function formatCents(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}
