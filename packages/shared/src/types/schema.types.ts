import type { z } from "zod";

import type { listRefundsQuerySchema } from "../schemas/admin.schemas.js";
import type { extractedClaimsSchema } from "../schemas/ai.schemas.js";
import type {
  createRefundRequestSchema,
  reviewRefundRequestSchema,
} from "../schemas/refund.schemas.js";

export type CreateRefundRequestInput = z.infer<typeof createRefundRequestSchema>;
export type ReviewRefundRequestInput = z.infer<typeof reviewRefundRequestSchema>;
export type ListRefundsQuery = z.infer<typeof listRefundsQuerySchema>;
export type ExtractedClaims = z.infer<typeof extractedClaimsSchema>;
