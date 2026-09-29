import Link from "next/link";

import { formatCents, formatDateTime, humanize } from "@/lib/format";
import { ruleLabel, STATUS_LABEL } from "@/lib/labels";
import type { RequestsTableProps } from "@/types/component.types";

import { Badge } from "../ui/badge";
import { VerdictBadge } from "../ui/verdict-badge";

export function RequestsTable({ rows }: RequestsTableProps) {
  if (rows.length === 0) {
    return <p className="py-12 text-center text-sm text-stone-500">No refund requests match this filter.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-stone-200 text-xs text-stone-500">
          <tr>
            <th className="py-2 pr-4 font-medium">Received</th>
            <th className="py-2 pr-4 font-medium">Customer</th>
            <th className="py-2 pr-4 font-medium">Order</th>
            <th className="py-2 pr-4 text-right font-medium">Amount</th>
            <th className="py-2 pr-4 font-medium">Reason (AI)</th>
            <th className="py-2 pr-4 font-medium">Decided by</th>
            <th className="py-2 pr-4 font-medium">Verdict</th>
            <th className="py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-stone-50">
              <td className="py-2.5 pr-4 whitespace-nowrap text-stone-600">
                <Link href={`/admin/requests/${row.id}`} className="hover:underline">
                  {formatDateTime(row.createdAt)}
                </Link>
              </td>
              <td className="py-2.5 pr-4">
                <Link href={`/admin/requests/${row.id}`} className="font-medium text-stone-900 hover:underline">
                  {row.customerName}
                </Link>
              </td>
              <td className="py-2.5 pr-4 text-stone-600">{row.orderNumber}</td>
              <td className="py-2.5 pr-4 text-right tabular-nums">{formatCents(row.amountCents)}</td>
              <td className="py-2.5 pr-4 text-stone-600">{row.reasonCategory ? humanize(row.reasonCategory) : "Unknown"}</td>
              <td className="py-2.5 pr-4 text-stone-600">{row.decidingRule ? ruleLabel(row.decidingRule) : "Imported"}</td>
              <td className="py-2.5 pr-4"><VerdictBadge verdict={row.verdict} /></td>
              <td className="py-2.5">
                {row.status === "PENDING_REVIEW" ? (
                  <Link
                    href={`/admin/requests/${row.id}#review`}
                    className="inline-flex items-center rounded-md bg-stone-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-stone-700"
                  >
                    Review →
                  </Link>
                ) : (
                  <Badge tone="neutral">{STATUS_LABEL[row.status]}</Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
