import { z } from "zod";

import { REFUND_STATUSES, REFUND_VERDICTS } from "../constants/refund.constants.js";

/** Query string of GET /admin/refund-requests */
export const listRefundsQuerySchema = z.object({
  status: z.enum(REFUND_STATUSES).optional(),
  verdict: z.enum(REFUND_VERDICTS).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
