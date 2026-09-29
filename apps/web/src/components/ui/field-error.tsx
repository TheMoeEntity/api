import type { FieldErrorProps } from "@/types/component.types";

export function FieldError({ messages }: FieldErrorProps) {
  if (!messages?.length) return null;
  return <p className="mt-1 text-xs text-red-700">{messages[0]}</p>;
}
