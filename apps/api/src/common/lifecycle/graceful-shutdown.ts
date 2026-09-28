import type { GracefulShutdownDeps } from "../../types/lifecycle.types.js";

/**
 * On SIGTERM (what `docker compose down` sends), stop accepting new
 * connections, let in-flight requests finish, close the DB pool, exit.
 *
 * Without this, a refund request mid-pipeline could be cut off after the
 * AI call but before its audit row is written.
 */
export function registerGracefulShutdown({
  server,
  prisma,
  logger,
  timeoutMs = 10_000,
}: GracefulShutdownDeps): void {
  let shuttingDown = false;

  const shutdown = (signal: NodeJS.Signals): void => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, "Shutting down gracefully");

    // Safety net: never hang forever on a stuck connection.
    const forceExit = setTimeout(() => {
      logger.error("Shutdown timed out, forcing exit");
      process.exit(1);
    }, timeoutMs);
    forceExit.unref();

    server.close(async (closeError) => {
      try {
        await prisma.$disconnect();
      } finally {
        if (closeError) logger.error({ err: closeError }, "Error while closing server");
        process.exit(closeError ? 1 : 0);
      }
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
