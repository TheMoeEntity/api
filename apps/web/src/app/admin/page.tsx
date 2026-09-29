import { listRefundsQuerySchema, REFUND_STATUSES, REFUND_VERDICTS } from "@refund-desk/shared";

import { FilterBar } from "@/components/admin/filter-bar";
import { RequestsTable } from "@/components/admin/requests-table";
import { StatCards } from "@/components/admin/stat-cards";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { firstParam } from "@/lib/format";
import { STATUS_LABEL, VERDICT_LABEL } from "@/lib/labels";
import { apiClient } from "@/lib/server/api-client";
import { ApiError } from "@/lib/server/api-error";
import type { SearchParamsProps } from "@/types/page.types";
import type { FilterOption } from "@/types/ui.types";

export default async function AdminPage({ searchParams }: SearchParamsProps) {
  const params = await searchParams;
  // Unknown filter values are ignored rather than sent to the API.
  const parsed = listRefundsQuerySchema.safeParse({
    status: firstParam(params.status),
    verdict: firstParam(params.verdict),
  });
  const filter = parsed.success ? parsed.data : { limit: 50 };

  const query = new URLSearchParams();
  if (filter.status) query.set("status", filter.status);
  if (filter.verdict) query.set("verdict", filter.verdict);

  const options: FilterOption[] = [
    { label: "All", href: "/admin", active: !filter.status && !filter.verdict },
    ...REFUND_STATUSES.filter((s) => s === "PENDING_REVIEW").map((s) => ({
      label: STATUS_LABEL[s],
      href: `/admin?status=${s}`,
      active: filter.status === s,
    })),
    ...REFUND_VERDICTS.map((v) => ({ label: VERDICT_LABEL[v], href: `/admin?verdict=${v}`, active: filter.verdict === v })),
  ];

  try {
    const [stats, rows] = await Promise.all([apiClient.getStats(), apiClient.listRefunds(query)]);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Support dashboard</h1>
          <p className="mt-1 text-sm text-stone-600">Every refund decision, why it was made, and the ones waiting for a human.</p>
        </div>
        <StatCards stats={stats} />
        <Card title="Recent requests" action={<FilterBar options={options} />}>
          <RequestsTable rows={rows} />
        </Card>
      </div>
    );
  } catch (err) {
    if (err instanceof ApiError) return <Alert>{err.message}</Alert>;
    throw err;
  }
}
