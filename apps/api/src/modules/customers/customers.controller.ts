import type { RequestHandler } from "express";

import { AppError } from "../../common/errors/app-error.js";
import { parseIdParam } from "../../common/utils/validation.utils.js";
import { toCustomerOrdersDto } from "./customers.mapper.js";
import type { CustomerRepository } from "./customers.repository.js";

export class CustomerController {
  constructor(private readonly customers: CustomerRepository) {}

  list: RequestHandler = async (_req, res) => {
    res.json(await this.customers.listCustomers());
  };

  orders: RequestHandler = async (req, res) => {
    const customerId = parseIdParam(req.params.id, "Customer");
    const record = await this.customers.findWithOrders(customerId);
    if (!record) throw AppError.notFound("Customer not found");
    res.json(toCustomerOrdersDto(record));
  };
}
