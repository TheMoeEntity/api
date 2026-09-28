import type { PolicyRule } from "../../types/policy.types.js";
import { daysSinceDelivery, isChangeOfMind, isDefectReason } from "../policy.helpers.js";

export const approveRules: PolicyRule[] = [
  {
    code: "APPROVE_DEFECT_WITHIN_WINDOW",
    group: "APPROVE",
    applies: (ctx, config) => {
      const days = daysSinceDelivery(ctx);
      return isDefectReason(ctx) && days !== null && days <= config.defectWindowDays;
    },
  },
  {
    code: "APPROVE_CHANGE_OF_MIND_WITHIN_WINDOW",
    group: "APPROVE",
    applies: (ctx, config) => {
      const days = daysSinceDelivery(ctx);
      return isChangeOfMind(ctx) && days !== null && days <= config.changeOfMindWindowDays;
    },
  },
];
