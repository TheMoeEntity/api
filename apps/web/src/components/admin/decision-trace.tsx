import { humanize } from "@/lib/format";
import { ruleLabel } from "@/lib/labels";
import { describeReplySource } from "@/lib/trace";
import type { DecisionTraceProps, TraceStepProps } from "@/types/component.types";

import { Badge } from "../ui/badge";

/** The pipeline, step by step, rebuilt from the append-only audit row. */
export function DecisionTrace({ audit }: DecisionTraceProps) {
  const claims = audit.extractedClaims;

  return (
    <ol className="space-y-4 text-sm">
      <Step n={1} title="Injection scan (code)">
        {audit.injectionSignals.length ? (
          <div className="flex flex-wrap gap-1.5">
            {audit.injectionSignals.map((s) => <Badge key={s} tone="accent">{humanize(s)}</Badge>)}
          </div>
        ) : (
          <p className="text-stone-600">No suspicious patterns found.</p>
        )}
      </Step>

      <Step n={2} title="AI read the message">
        {claims ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <dt className="text-stone-500">Reason</dt><dd>{humanize(claims.reasonCategory)}</dd>
            <dt className="text-stone-500">Summary</dt><dd>{claims.summary}</dd>
            <dt className="text-stone-500">Manipulation</dt>
            <dd>{claims.manipulationAttempt ? <Badge tone="accent">Suspected</Badge> : "None detected"}</dd>
          </dl>
        ) : (
          <p className="text-stone-600">AI unavailable. Reason treated as unknown (fail closed).</p>
        )}
      </Step>

      <Step n={3} title="Policy rules (code decides)">
        <ul className="space-y-1">
          {audit.rulesTriggered.map((code) => (
            <li key={code} className="flex items-center gap-2">
              <span className={code === audit.decidingRule ? "font-medium text-stone-900" : "text-stone-600"}>{ruleLabel(code)}</span>
              {code === audit.decidingRule && <Badge tone="neutral">Deciding rule</Badge>}
            </li>
          ))}
        </ul>
      </Step>

      <Step n={4} title="Customer reply">
        <p className="text-stone-600">{describeReplySource(audit)}</p>
      </Step>

      <li className="border-t border-stone-100 pt-3 text-xs text-stone-500">
        {audit.aiProvider} · {audit.model ?? "no model"} · prompt {audit.promptVersion ?? "n/a"} · {audit.latencyMs} ms
        {audit.tokensIn !== null && ` · ${audit.tokensIn} in / ${audit.tokensOut} out tokens`}
      </li>
    </ol>
  );
}

function Step({ n, title, children }: TraceStepProps) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-medium text-stone-700">{n}</span>
      <div className="min-w-0 flex-1">
        <p className="mb-1 font-medium text-stone-900">{title}</p>
        {children}
      </div>
    </li>
  );
}
