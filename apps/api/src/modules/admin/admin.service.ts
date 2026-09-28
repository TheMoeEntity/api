import type {
  ListRefundsQuery,
  RefundDetailDto,
  RefundListItemDto,
  RefundStatsDto,
  ReviewRefundRequestInput,
} from "@refund-desk/shared";

import { AppError } from "../../common/errors/app-error.js";
import { toRefundDetailDto, toRefundListItemDto } from "./admin.mapper.js";
import type { AdminRepository } from "./admin.repository.js";

export class AdminService {
  constructor(private readonly admin: AdminRepository) {}

  async list(query: ListRefundsQuery): Promise<RefundListItemDto[]> {
    const records = await this.admin.list(query);
    return records.map(toRefundListItemDto);
  }

  stats(): Promise<RefundStatsDto> {
    return this.admin.stats();
  }

  async detail(id: string): Promise<RefundDetailDto> {
    const record = await this.admin.findDetail(id);
    if (!record) throw AppError.notFound("Refund request not found");
    return toRefundDetailDto(record);
  }

  async review(id: string, input: ReviewRefundRequestInput): Promise<RefundDetailDto> {
    const exists = await this.admin.findDetail(id);
    if (!exists) throw AppError.notFound("Refund request not found");

    const recorded = await this.admin.recordReview({ refundRequestId: id, ...input });
    if (!recorded) throw AppError.conflict("This request has already been reviewed");

    return this.detail(id);
  }
}
