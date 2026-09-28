import type { PolicyRule } from "../../types/policy.types.js";
import { approveRules } from "./approve.rules.js";
import { denyRules } from "./deny.rules.js";
import { reviewRules } from "./review.rules.js";
import { securityRules } from "./security.rules.js";

export const allRules: PolicyRule[] = [
  ...securityRules,
  ...denyRules,
  ...reviewRules,
  ...approveRules,
];
