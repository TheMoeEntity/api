import { randomUUID } from "node:crypto";

import express, { type Express } from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";

import { createErrorHandler } from "./common/middleware/error-handler.js";
import { notFoundHandler } from "./common/middleware/not-found-handler.js";
import { createAdminRouter } from "./modules/admin/admin.routes.js";
import { createCustomerRouter } from "./modules/customers/customers.routes.js";
import { createHealthRouter } from "./modules/health/health.routes.js";
import { createRefundRouter } from "./modules/refunds/refunds.routes.js";
import type { AppDependencies } from "./types/app.types.js";

/**
 * Builds the Express app from already-constructed dependencies.
 * It never calls `new` on a service: that's the composition root's job.
 * Tests can call createApp() with fakes and hit it with supertest.
 */
export function createApp({
  logger,
  requireAdmin,
  refundSubmitRateLimit,
  controllers,
}: AppDependencies): Express {
  const app = express();

  app.use(helmet());
  app.use(
    pinoHttp({
      logger,
      // Reuse an upstream request ID (e.g. from the Next.js BFF) or mint one,
      // so one refund can be traced across both services' logs.
      genReqId: (req, res) => {
        const incoming = req.headers["x-request-id"];
        const id = typeof incoming === "string" && incoming.length > 0 ? incoming : randomUUID();
        res.setHeader("x-request-id", id);
        return id;
      },
    }),
  );

  // Small cap on purpose: every byte of a refund message may be sent to an
  // LLM, and we pay per token. Big payloads are either bugs or abuse.
  app.use(express.json({ limit: "32kb" }));

  app.use("/health", createHealthRouter(controllers.health));
  app.use("/customers", createCustomerRouter(controllers.customers));
  app.use("/refund-requests", createRefundRouter(controllers.refunds, refundSubmitRateLimit));
  app.use("/admin", createAdminRouter(controllers.admin, requireAdmin));

  app.use(notFoundHandler);
  app.use(createErrorHandler(logger));

  return app;
}
