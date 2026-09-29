"use client";

import { useActionState } from "react";

import { reviewRefundAction } from "@/actions/review.actions";
import type { ReviewRefundState } from "@/types/action.types";
import type { ReviewFormProps } from "@/types/component.types";

import { Alert } from "../ui/alert";
import { FieldError } from "../ui/field-error";

const INITIAL_STATE: ReviewRefundState = { status: "idle" };

export function ReviewForm({ refundId }: ReviewFormProps) {
  const [state, formAction, isPending] = useActionState(reviewRefundAction.bind(null, refundId), INITIAL_STATE);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-4 text-sm">
      <fieldset className="flex gap-3">
        <legend className="sr-only">Decision</legend>
        {(["APPROVE", "DENY"] as const).map((decision) => (
          <label key={decision} className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50/50">
            <input type="radio" name="decision" value={decision} defaultChecked={decision === "APPROVE"} />
            {decision === "APPROVE" ? "Approve refund" : "Deny refund"}
          </label>
        ))}
      </fieldset>
      <label className="block">
        <span className="text-xs font-medium text-stone-500">Your name</span>
        <input name="reviewerName" className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-indigo-500 focus:outline-none" />
        <FieldError messages={fieldErrors?.reviewerName} />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-stone-500">Note (kept in the audit trail)</span>
        <textarea name="note" rows={3} className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-indigo-500 focus:outline-none" />
        <FieldError messages={fieldErrors?.note} />
      </label>
      {state.status === "error" && !fieldErrors && <Alert>{state.message}</Alert>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-stone-900 px-4 py-2 font-medium text-white hover:bg-stone-800 disabled:opacity-70"
      >
        {isPending ? "Saving…" : "Record decision"}
      </button>
    </form>
  );
}
