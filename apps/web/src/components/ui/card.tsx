import type { CardProps } from "@/types/component.types";

export function Card({ title, action, children }: CardProps) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white">
      {title && (
        <header className="flex items-center justify-between border-b border-stone-100 px-5 py-3">
          <h2 className="text-sm font-medium text-stone-900">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
