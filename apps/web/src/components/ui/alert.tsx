import type { AlertProps } from "@/types/component.types";

export function Alert({ children }: AlertProps) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {children}
    </div>
  );
}
