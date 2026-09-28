import { reviewRefundRequestSchema } from "@refund-desk/shared";
import { Router, type RequestHandler } from "express";

import { validateBody } from "../../common/middleware/validate.js";
import type { AdminController } from "./admin.controller.js";

export function createAdminRouter(controller: AdminController, requireAdmin: RequestHandler): Router {
  const router = Router();
  router.use(requireAdmin);

  // "/stats" must be registered before "/:id", or Express reads "stats" as an id.
  router.get("/refund-requests/stats", controller.stats);
  router.get("/refund-requests", controller.list);
  router.get("/refund-requests/:id", controller.detail);
  router.post("/refund-requests/:id/review", validateBody(reviewRefundRequestSchema), controller.review);

  return router;
}
