import { Router } from "express";

import type { CustomerController } from "./customers.controller.js";

export function createCustomerRouter(controller: CustomerController): Router {
  const router = Router();
  router.get("/", controller.list);
  router.get("/:id/orders", controller.orders);
  return router;
}
