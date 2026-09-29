"use client";

import { REFUND_MESSAGE_MAX_LENGTH } from "@refund-desk/shared";
import { useActionState, useEffect, useMemo, useState } from "react";

import { submitRefundAction } from "@/actions/refund.actions";
import { formatCents, formatDate, humanize } from "@/lib/format";
import type { SubmitRefundState } from "@/types/action.types";
import type { RefundRequestPanelProps } from "@/types/component.types";
import type { ThreadEntry } from "@/types/ui.types";

import { Alert } from "../ui/alert";
import { Badge } from "../ui/badge";
import { FieldError } from "../ui/field-error";
import { Conversation } from "./conversation";

const INITIAL_STATE: SubmitRefundState = { status: "idle" };

export function RefundRequestPanel({ customerId, orders, hint }: RefundRequestPanelProps) {
  const [state, formAction, isPending] = useActionState(submitRefundAction, INITIAL_STATE);

  // One key per submission attempt. A retry after a network error reuses
  // it (the API replays the result); a new request gets a fresh one.
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [orderId, setOrderId] = useState(orders[0]?.id ?? "");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [thread, setThread] = useState<ThreadEntry[]>([]);

  const order = useMemo(() => orders.find((o) => o.id === orderId), [orders, orderId]);

  useEffect(() => {
    if (state.status !== "success") return;
    const itemNames = order?.items.filter((i) => selectedItemIds.includes(i.id)).map((i) => i.name) ?? [];
    setThread((prev) => [
      ...prev,
      { id: `${state.decision.id}-${state.submittedAt}`, customerMessage: state.customerMessage, itemNames, decision: state.decision },
    ]);
    setIdempotencyKey(crypto.randomUUID());
    setMessage("");
    setSelectedItemIds([]);
    // Only react to a NEW result, not to the user changing the selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  function toggleItem(id: string) {
    setSelectedItemIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function selectOrder(id: string) {
    setOrderId(id);
    setSelectedItemIds([]);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form action={formAction} className="space-y-5 rounded-xl border border-stone-200 bg-white p-5">
        <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
        <input type="hidden" name="customerId" value={customerId} />
        <input type="hidden" name="orderId" value={orderId} />

        <fieldset>
          <legend className="text-sm font-medium text-stone-900">1. Which order?</legend>
          <div className="mt-2 space-y-2">
            {orders.map((o) => (
              <label
                key={o.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                  o.id === orderId ? "border-indigo-500 bg-indigo-50/50" : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <input type="radio" name="orderChoice" checked={o.id === orderId} onChange={() => selectOrder(o.id)} />
                  <span className="font-medium text-stone-900">{o.orderNumber}</span>
                  <span className="text-stone-500">placed {formatDate(o.placedAt)}</span>
                </span>
                <Badge tone={o.status === "DELIVERED" ? "neutral" : "accent"}>
                  {o.status === "DELIVERED" && o.deliveredAt ? `Delivered ${formatDate(o.deliveredAt)}` : humanize(o.status)}
                </Badge>
              </label>
            ))}
          </div>
        </fieldset>

        {order && (
          <fieldset>
            <legend className="text-sm font-medium text-stone-900">2. Which items?</legend>
            <div className="mt-2 space-y-2">
              {order.items.map((item) => (
                <label key={item.id} className="flex cursor-pointer items-center justify-between rounded-lg border border-stone-200 px-3 py-2 text-sm hover:border-stone-300">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="itemId"
                      value={item.id}
                      checked={selectedItemIds.includes(item.id)}
                      onChange={() => toggleItem(item.id)}
                    />
                    <span className="text-stone-900">{item.name}</span>
                    {item.isFinalSale && <Badge tone="warning">Final sale</Badge>}
                  </span>
                  <span className="text-stone-600">
                    {item.quantity} × {formatCents(item.unitPriceCents)}
                  </span>
                  <input type="hidden" name={`qty:${item.id}`} value={item.quantity} />
                </label>
              ))}
            </div>
            <FieldError messages={fieldErrors?.items} />
          </fieldset>
        )}

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="message" className="text-sm font-medium text-stone-900">
              3. What happened?
            </label>
            {hint && (
              <button type="button" onClick={() => setMessage(hint.suggestedMessage)} className="text-xs text-indigo-600 hover:text-indigo-800">
                Use sample message
              </button>
            )}
          </div>
          <textarea
            id="message"
            name="message"
            rows={4}
            maxLength={REFUND_MESSAGE_MAX_LENGTH}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="The item arrived damaged…"
            className="mt-2 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-indigo-500 focus:outline-none"
          />
          <FieldError messages={fieldErrors?.message} />
          {hint && <p className="mt-1 text-xs text-stone-500">Demo scenario: {hint.expected}</p>}
        </div>

        {state.status === "error" && !fieldErrors && <Alert>{state.message}</Alert>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-70"
        >
          {isPending ? "Reviewing your request…" : "Submit refund request"}
        </button>
      </form>

      <section className="rounded-xl border border-stone-200 bg-stone-50 p-5">
        <h2 className="mb-4 text-sm font-medium text-stone-900">Conversation</h2>
        <Conversation entries={thread} />
      </section>
    </div>
  );
}
