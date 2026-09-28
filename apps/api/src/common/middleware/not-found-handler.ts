import type { RequestHandler } from "express";

import { AppError } from "../errors/app-error.js";

export const notFoundHandler: RequestHandler = (req) => {
  throw AppError.notFound(`Route ${req.method} ${req.path} does not exist`);
};
