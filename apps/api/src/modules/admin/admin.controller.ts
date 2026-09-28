import { listRefundsQuerySchema, type ReviewRefundRequestInput } from "@refund-desk/shared";
import type { RequestHandler } from "express";

import { parseIdParam, parseOrThrow } from "../../common/utils/validation.utils.js";
import type { AdminService } from "./admin.service.js";

export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  list: RequestHandler = async (req, res) => {
    const query = parseOrThrow(listRefundsQuerySchema, req.query, "Query");
    res.json(await this.adminService.list(query));
  };

  stats: RequestHandler = async (_req, res) => {
    res.json(await this.adminService.stats());
  };

  detail: RequestHandler = async (req, res) => {
    const id = parseIdParam(req.params.id, "Refund request");
    res.json(await this.adminService.detail(id));
  };

  review: RequestHandler = async (req, res) => {
    const id = parseIdParam(req.params.id, "Refund request");
    res.json(await this.adminService.review(id, req.body as ReviewRefundRequestInput));
  };
}
