"use server";

import { createRefundRequestSchema } from "@refund-desk/shared";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { field, fields } from "@/lib/form-data";
import { apiClient } from "@/lib/server/api-client";
import { ApiError } from "@/lib/server/api-error";
import type { SubmitRefundState } from "@/types/action.types";

/**
 * Validates with the SAME shared schema the API uses, so the customer gets
 * instant field errors without a round trip. The API validates again:
 * never trust the layer in front of you.
 */
export async function submitRefundAction(_prev: SubmitRefundState, formData: FormData): Promise<SubmitRefundState> {
  const submittedAt = Date.now();
  const parsed = createRefundRequestSchema.safeParse({
    idempotencyKey: field(formData, "idempotencyKey"),
    customerId: field(formData, "customerId"),
    orderId: field(formData, "orderId"),
    // Demo scope: each selected line is refunded in full (see README trade-offs).
    items: fields(formData, "itemId").map((orderItemId) => ({
      orderItemId,
      quantity: Number(field(formData, `qty:${orderItemId}`)) || 1,
    })),
    message: field(formData, "message"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
      submittedAt,
    };
  }

  try {
    const decision = await apiClient.submitRefund(parsed.data);
    revalidatePath("/admin");
    return { status: "success", decision, customerMessage: parsed.data.message, submittedAt };
  } catch (err) {
    if (err instanceof ApiError) return { status: "error", message: err.message, submittedAt };
    throw err;
  }
}
