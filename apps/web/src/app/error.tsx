"use client";

import type { ErrorPageProps } from "@/types/component.types";

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <div className="py-20 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-stone-600">The error has been logged. Please try again.</p>
      <button onClick={reset} className="mt-4 rounded-lg border border-stone-300 px-4 py-2 text-sm hover:bg-stone-100">
        Try again
      </button>
    </div>
  );
}
