import { formatCents } from "@/lib/format";
import { joinNaturally } from "@/lib/text";
import type { ConversationProps } from "@/types/component.types";

import { VerdictBadge } from "../ui/verdict-badge";

export function Conversation({ entries }: ConversationProps) {
  if (entries.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-stone-500">
        Your conversation with support will appear here.
      </p>
    );
  }

  return (
    <ol className="space-y-5">
      {entries.map((entry) => (
        <li key={entry.id} className="space-y-3">
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-3 text-sm text-white">
              <p className="mb-1 text-xs text-indigo-200">About: {joinNaturally(entry.itemNames)}</p>
              <p className="whitespace-pre-wrap">{entry.customerMessage}</p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-stone-500">Refund Desk</span>
                <VerdictBadge verdict={entry.decision.verdict} />
                <span className="text-xs text-stone-500">{formatCents(entry.decision.refundAmountCents)}</span>
                {entry.decision.replayed && <span className="text-xs text-stone-400">(already submitted)</span>}
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{entry.decision.customerReply}</p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
