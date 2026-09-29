"use server";

import { reviewRefundRequestSchema } from "@refund-desk/shared";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { field } from "@/lib/form-data";
import { apiClient } from "@/lib/server/api-client";
import { ApiError } from "@/lib/server/api-error";
import type { ReviewRefundState } from "@/types/action.types";

export async function reviewRefundAction(
  refundId: string,
  _prev: ReviewRefundState,
  formData: FormData,
): Promise<ReviewRefundState> {
  const parsed = reviewRefundRequestSchema.safeParse({
    decision: field(formData, "decision"),
    reviewerName: field(formData, "reviewerName"),
    note: field(formData, "note"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const detail = await apiClient.reviewRefund(refundId, parsed.data);
    revalidatePath("/admin");
    revalidatePath(`/admin/requests/${refundId}`);
    return { status: "success", detail };
  } catch (err) {
    if (err instanceof ApiError) return { status: "error", message: err.message };
    throw err;
  }
}
