import { createRefundRequestSchema } from "@refund-desk/shared";
import { Router, type RequestHandler } from "express";

import { validateBody } from "../../common/middleware/validate.js";
import type { RefundController } from "./refunds.controller.js";

export function createRefundRouter(controller: RefundController, submitRateLimit: RequestHandler): Router {
  const router = Router();
  // Order matters: validate first (so customerId is trustworthy), then count.
  router.post("/", validateBody(createRefundRequestSchema), submitRateLimit, controller.submit);
  return router;
}
