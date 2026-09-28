// Fires two DIFFERENT refund submissions for the same item at the same
// moment against the running API. Expected: one 201, one 409.
const BASE = process.env.API_URL ?? "http://localhost:4000";
const EMAIL = process.argv[2] ?? "amaka.nnaji@example.com";

const customers = await (await fetch(`${BASE}/customers`)).json();
const customer = customers.find((c) => c.email === EMAIL);
if (!customer) throw new Error(`No customer ${EMAIL}`);

const { orders } = await (await fetch(`${BASE}/customers/${customer.id}/orders`)).json();
const order = orders[0];
const item = order.items[0];

const submit = () =>
  fetch(`${BASE}/refund-requests`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      idempotencyKey: crypto.randomUUID(),
      customerId: customer.id,
      orderId: order.id,
      items: [{ orderItemId: item.id, quantity: item.quantity }],
      message: "I ordered the espresso machine but received a drip coffee maker instead.",
    }),
  }).then(async (res) => ({ status: res.status, body: await res.json() }));

const results = await Promise.all([submit(), submit()]);
for (const r of results) console.log(r.status, r.body.verdict ?? r.body.error?.message);