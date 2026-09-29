import { CustomerPicker } from "@/components/customer/customer-picker";
import { RefundRequestPanel } from "@/components/customer/refund-request-panel";
import { Alert } from "@/components/ui/alert";
import { DEMO_HINTS } from "@/lib/demo-hints";
import { firstParam } from "@/lib/format";
import { apiClient } from "@/lib/server/api-client";
import { ApiError } from "@/lib/server/api-error";
import type { SearchParamsProps } from "@/types/page.types";

export default async function CustomerPage({ searchParams }: SearchParamsProps) {
  const selectedId = firstParam((await searchParams).customer);

  try {
    const customers = await apiClient.listCustomers();
    const data = selectedId ? await apiClient.getCustomerOrders(selectedId) : null;

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Request a refund</h1>
            <p className="mt-1 text-sm text-stone-600">
              Tell us what went wrong. Most requests get an answer in a few seconds.
            </p>
          </div>
          <div className="sm:w-96">
            <CustomerPicker customers={customers} selectedId={selectedId} />
          </div>
        </div>

        {data ? (
          <RefundRequestPanel
            key={data.customer.id}
            customerId={data.customer.id}
            orders={data.orders}
            hint={DEMO_HINTS[data.customer.email]}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center text-sm text-stone-500">
            Choose a customer above to see their orders.
          </div>
        )}
      </div>
    );
  } catch (err) {
    if (err instanceof ApiError) return <Alert>{err.message}</Alert>;
    throw err;
  }
}
