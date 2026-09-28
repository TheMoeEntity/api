import type { PolicyRule } from "../../types/policy.types.js";
import { daysSinceDelivery, isChangeOfMind, isDefectReason } from "../policy.helpers.js";

export const denyRules: PolicyRule[] = [
  {
    code: "DENY_ORDER_CANCELLED",
    group: "DENY",
    applies: (ctx) => ctx.order.status === "CANCELLED",
  },
  {
    code: "DENY_FINAL_SALE_ITEM",
    group: "DENY",
    applies: (ctx) => ctx.items.some((item) => item.isFinalSale),
  },
  {
    code: "DENY_OUTSIDE_DEFECT_WINDOW",
    group: "DENY",
    applies: (ctx, config) => {
      const days = daysSinceDelivery(ctx);
      return isDefectReason(ctx) && days !== null && days > config.defectWindowDays;
    },
  },
  {
    code: "DENY_OUTSIDE_CHANGE_OF_MIND_WINDOW",
    group: "DENY",
    applies: (ctx, config) => {
      const days = daysSinceDelivery(ctx);
      return isChangeOfMind(ctx) && days !== null && days > config.changeOfMindWindowDays;
    },
  },
];
