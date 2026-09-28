import type { ListRefundsQuery, RefundStatsDto } from "@refund-desk/shared";

import type { PrismaClient } from "../../generated/prisma/client.js";
import type { NewReview, RefundDetailRecord, RefundListRecord } from "../../types/admin.types.js";
import { refundDetailSelect, refundListSelect } from "./admin.selects.js";

export class AdminRepository {
  constructor(private readonly prisma: PrismaClient) {}

  list(query: ListRefundsQuery): Promise<RefundListRecord[]> {
    return this.prisma.refundRequest.findMany({
      where: { status: query.status, verdict: query.verdict },
      orderBy: { createdAt: "desc" },
      take: query.limit,
      select: refundListSelect,
    });
  }

  async stats(): Promise<RefundStatsDto> {
    const [byVerdict, pendingReview] = await Promise.all([
      this.prisma.refundRequest.groupBy({ by: ["verdict"], _count: { _all: true } }),
      this.prisma.refundRequest.count({ where: { status: "PENDING_REVIEW" } }),
    ]);

    const countOf = (verdict: string) => byVerdict.find((row) => row.verdict === verdict)?._count._all ?? 0;
    const approved = countOf("APPROVED");
    const denied = countOf("DENIED");
    const escalated = countOf("ESCALATED");

    return { total: approved + denied + escalated, approved, denied, escalated, pendingReview };
  }

  findDetail(id: string): Promise<RefundDetailRecord | null> {
    return this.prisma.refundRequest.findUnique({ where: { id }, select: refundDetailSelect });
  }

  /**
   * Returns false if the request was no longer pending.
   *
   * Two reviewers clicking at the same moment: both would pass a
   * "read status, then write" check. Instead the UPDATE itself carries the
   * condition (WHERE status = 'PENDING_REVIEW'), so the database lets
   * exactly one win. The loser updates 0 rows and gets a 409.
   */
  async recordReview(review: NewReview): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const { count } = await tx.refundRequest.updateMany({
        where: { id: review.refundRequestId, status: "PENDING_REVIEW" },
        data: { status: "RESOLVED" },
      });
      if (count === 0) return false;

      await tx.reviewAction.create({ data: review });
      return true;
    });
  }
}
