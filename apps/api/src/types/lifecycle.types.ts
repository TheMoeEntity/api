import type { Server } from "node:http";
import type { Logger } from "pino";

import type { PrismaClient } from "../generated/prisma/client.js";

export interface GracefulShutdownDeps {
  server: Server;
  prisma: PrismaClient;
  logger: Logger;
  timeoutMs?: number;
}
