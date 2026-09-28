import type { RequestHandler } from "express";
import type { Logger } from "pino";

import type { AdminController } from "../modules/admin/admin.controller.js";
import type { CustomerController } from "../modules/customers/customers.controller.js";
import type { HealthController } from "../modules/health/health.controller.js";
import type { RefundController } from "../modules/refunds/refunds.controller.js";

/** Everything createApp() needs, built by the composition root. */
export interface AppDependencies {
  logger: Logger;
  requireAdmin: RequestHandler;
  refundSubmitRateLimit: RequestHandler;
  controllers: {
    health: HealthController;
    customers: CustomerController;
    refunds: RefundController;
    admin: AdminController;
  };
}
