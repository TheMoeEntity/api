import type { ReviewDecision } from "@refund-desk/shared";

import type { Prisma } from "../generated/prisma/client.js";
import type { refundDetailSelect, refundListSelect } from "../modules/admin/admin.selects.js";

export type RefundListRecord = Prisma.RefundRequestGetPayload<{ select: typeof refundListSelect }>;
export type RefundDetailRecord = Prisma.RefundRequestGetPayload<{ select: typeof refundDetailSelect }>;

export interface NewReview {
  refundRequestId: string;
  decision: ReviewDecision;
  reviewerName: string;
  note: string;
}
