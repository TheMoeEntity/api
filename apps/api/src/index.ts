import "dotenv/config";

import { AiGateway } from "./ai/ai.gateway.js";
import { createAiProvider } from "./ai/create-ai-provider.js";
import { createApp } from "./app.js";
import { registerGracefulShutdown } from "./common/lifecycle/graceful-shutdown.js";
import { createLogger } from "./common/logging/logger.js";
import { createCustomerRateLimit } from "./common/middleware/rate-limit.js";
import { requireAdminKey } from "./common/middleware/require-admin-key.js";
import { loadEnv } from "./config/env.js";
import { refundSubmitRateLimit } from "./config/rate-limit.config.js";
import { createPrismaClient } from "./database/prisma.js";
import { AdminController } from "./modules/admin/admin.controller.js";
import { AdminRepository } from "./modules/admin/admin.repository.js";
import { AdminService } from "./modules/admin/admin.service.js";
import { CustomerController } from "./modules/customers/customers.controller.js";
import { CustomerRepository } from "./modules/customers/customers.repository.js";
import { HealthController } from "./modules/health/health.controller.js";
import { HealthRepository } from "./modules/health/health.repository.js";
import { RefundController } from "./modules/refunds/refunds.controller.js";
import { RefundRepository } from "./modules/refunds/refunds.repository.js";
import { RefundService } from "./modules/refunds/refunds.service.js";
import { defaultPolicyConfig } from "./policy/policy.config.js";

// ─── Composition root ───────────────────────────────────────
// The ONLY file that calls `new` on infrastructure, repositories,
// services and controllers. Read top to bottom, it is the dependency
// graph of the whole backend.

// Infrastructure
const env = loadEnv();
const logger = createLogger(env);
const prisma = createPrismaClient(env.DATABASE_URL);
const aiGateway = new AiGateway(createAiProvider(env), logger);

// Repositories (the only classes that know Prisma exists)
const healthRepository = new HealthRepository(prisma);
const customerRepository = new CustomerRepository(prisma);
const refundRepository = new RefundRepository(prisma);
const adminRepository = new AdminRepository(prisma);

// Services (business logic)
const refundService = new RefundService(refundRepository, aiGateway, defaultPolicyConfig);
const adminService = new AdminService(adminRepository);

// Controllers (HTTP only)
const app = createApp({
  logger,
  requireAdmin: requireAdminKey(env.ADMIN_API_KEY),
  refundSubmitRateLimit: createCustomerRateLimit(refundSubmitRateLimit),
  controllers: {
    health: new HealthController(healthRepository),
    customers: new CustomerController(customerRepository),
    refunds: new RefundController(refundService),
    admin: new AdminController(adminService),
  },
});

const server = app.listen(env.API_PORT, () => {
  logger.info({ port: env.API_PORT, aiProvider: aiGateway.providerName }, "API ready");
});

registerGracefulShutdown({ server, prisma, logger });
