import type { RequestHandler } from "express";

import { AppError } from "../../common/errors/app-error.js";
import type { HealthResponse } from "../../types/health.types.js";
import type { HealthRepository } from "./health.repository.js";

/**
 * No service layer here on purpose: a health check has no business logic,
 * and a service that only forwards a call is ceremony, not architecture.
 *
 * Handlers are arrow-function properties so `this` stays bound when the
 * router receives them as bare callbacks.
 */
export class HealthController {
  constructor(private readonly healthRepository: HealthRepository) {}

  check: RequestHandler = async (_req, res) => {
    try {
      await this.healthRepository.pingDatabase();
    } catch {
      throw AppError.serviceUnavailable("Database is unreachable");
    }

    const body: HealthResponse = { status: "ok", database: "up" };
    res.json(body);
  };
}
