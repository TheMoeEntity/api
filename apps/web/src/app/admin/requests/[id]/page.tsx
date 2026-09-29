import Link from "next/link";
import { notFound } from "next/navigation";

import { DecisionTrace } from "@/components/admin/decision-trace";
import { ReviewForm } from "@/components/admin/review-form";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { formatCents, formatDateTime } from "@/lib/format";
import { STATUS_LABEL } from "@/lib/labels";
import { apiClient } from "@/lib/server/api-client";
import { ApiError } from "@/lib/server/api-error";
import type { IdPageProps } from "@/types/page.types";

export default async function RefundDetailPage({ params }: IdPageProps) {
  const { id } = await params;

  let detail;
  try {
    detail = await apiClient.getRefund(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    if (err instanceof ApiError) return <Alert>{err.message}</Alert>;
    throw err;
  }

  return (
    <div className="space-y-6">
      <Link href="/admin" className="text-sm text-stone-500 hover:text-stone-900">← Back to dashboard</Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{detail.orderNumber}</h1>
        <VerdictBadge verdict={detail.verdict} />
        <Badge tone={detail.status === "PENDING_REVIEW" ? "warning" : "neutral"}>{STATUS_LABEL[detail.status]}</Badge>
        <span className="text-sm text-stone-500">
          {detail.customerName} · {detail.customerEmail} · {formatDateTime(detail.createdAt)}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-6">
          <Card title="Customer's message">
            <p className="whitespace-pre-wrap text-sm text-stone-800">{detail.message}</p>
          </Card>
          <Card title="Reply sent to customer">
            <p className="whitespace-pre-wrap text-sm text-stone-800">{detail.customerReply}</p>
          </Card>
          <Card title={`Items · ${formatCents(detail.amountCents)}`}>
            <ul className="divide-y divide-stone-100 text-sm">
              {detail.items.map((item) => (
                <li key={item.name} className="flex items-center justify-between py-2">
                  <span className="flex items-center gap-2">
                    {item.name}
                    {item.isFinalSale && <Badge tone="warning">Final sale</Badge>}
                  </span>
                  <span className="tabular-nums text-stone-600">{item.quantity} × {formatCents(item.unitPriceCents)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          {detail.status === "PENDING_REVIEW" && (
            <div id="review" className="scroll-mt-6">
              <Card title="Your decision is needed">
                <ReviewForm refundId={detail.id} />
              </Card>
            </div>
          )}

          <Card title="How this was decided">
            {detail.audit ? <DecisionTrace audit={detail.audit} /> : <p className="text-sm text-stone-500">Historical record, imported before this system existed.</p>}
          </Card>

          {detail.reviewActions.length > 0 && (
            <Card title="Review history">
              <ul className="space-y-3 text-sm">
                {detail.reviewActions.map((action) => (
                  <li key={action.id}>
                    <div className="flex items-center gap-2">
                      <Badge tone={action.decision === "APPROVE" ? "success" : "danger"}>
                        {action.decision === "APPROVE" ? "Approved" : "Denied"}
                      </Badge>
                      <span className="font-medium">{action.reviewerName}</span>
                      <span className="text-xs text-stone-500">{formatDateTime(action.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-stone-700">{action.note}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
