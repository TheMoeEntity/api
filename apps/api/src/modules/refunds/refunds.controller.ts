import type { CreateRefundRequestInput } from "@refund-desk/shared";
import type { RequestHandler } from "express";

import type { RefundService } from "./refunds.service.js";

export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  /** Body already validated by validateBody(createRefundRequestSchema). */
  submit: RequestHandler = async (req, res) => {
    const result = await this.refundService.submit(req.body as CreateRefundRequestInput);
    // 201 for a new decision, 200 when replaying an earlier one.
    res.status(result.replayed ? 200 : 201).json(result);
  };
}
