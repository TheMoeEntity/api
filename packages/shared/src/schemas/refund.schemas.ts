import { z } from "zod";

import {
  REFUND_MESSAGE_MAX_LENGTH,
  REFUND_MESSAGE_MIN_LENGTH,
  REVIEW_DECISIONS,
} from "../constants/refund.constants.js";

/**
 * Body of POST /refund-requests.
 *
 * Note what is NOT here: amounts, prices, dates, final-sale flags.
 * The client only says WHO, WHICH order/items and WHY. Every fact the
 * decision depends on is loaded from the database. Never trust the
 * client with facts you already own.
 */
export const createRefundRequestSchema = z.object({
  idempotencyKey: z.uuid(),
  customerId: z.uuid(),
  orderId: z.uuid(),
  items: z
    .array(
      z.object({
        orderItemId: z.uuid(),
        quantity: z.int().positive().max(100),
      }),
    )
    .min(1, "Select at least one item")
    .max(50),
  message: z
    .string()
    .trim()
    .min(REFUND_MESSAGE_MIN_LENGTH, "Please describe the issue in a bit more detail")
    .max(REFUND_MESSAGE_MAX_LENGTH),
});

/** Body of POST /admin/refund-requests/:id/review */
export const reviewRefundRequestSchema = z.object({
  decision: z.enum(REVIEW_DECISIONS),
  reviewerName: z.string().trim().min(2).max(80),
  note: z.string().trim().min(5).max(1000),
});
