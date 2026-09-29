import type { StatCardsProps } from "@/types/component.types";

export function StatCards({ stats }: StatCardsProps) {
  const rate = (n: number) => (stats.total ? `${Math.round((n / stats.total) * 100)}%` : "0%");
  const cards = [
    { label: "Total requests", value: String(stats.total), sub: "all time" },
    { label: "Approved", value: String(stats.approved), sub: rate(stats.approved) },
    { label: "Denied", value: String(stats.denied), sub: rate(stats.denied) },
    { label: "Escalated", value: String(stats.escalated), sub: rate(stats.escalated) },
    { label: "Awaiting review", value: String(stats.pendingReview), sub: "needs a human" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-stone-200 bg-white px-4 py-3">
          <p className="text-xs text-stone-500">{card.label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{card.value}</p>
          <p className="text-xs text-stone-400">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
