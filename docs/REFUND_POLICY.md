# Refund Policy

This is the policy the refund system enforces. Every rule has a code; the
same codes appear in the admin dashboard, the audit log and the source
(`packages/shared/src/constants/refund.constants.ts`).

Thresholds live in one config file (`apps/api/src/policy/policy.config.ts`)
so the business can change a number without changing logic.

| Setting | Value |
|---|---|
| Defect window (damaged, wrong item, not as described) | 30 days from delivery |
| Change-of-mind window | 14 days from delivery |
| Human review threshold | Refund amount **above** $500.00 |
| Repeat-requester limit | 3 or more refund requests in the previous 60 days |

## How a decision is made

Rules are evaluated in priority order. The first group that fires decides
the verdict. Within a group, every matching rule is still recorded in the
audit log so reviewers see the full picture.

### 1. Security: always escalate

| Code | Rule |
|---|---|
| `SEC_INJECTION_SUSPECTED` | The message tries to instruct the system, override the policy or impersonate staff. |
| `SEC_CLAIM_CONFLICTS_WITH_RECORD` | The customer's claim contradicts our records (e.g. "never arrived" on an order marked delivered). |

A human reviews these. The customer is told their request is under review,
never that it was flagged.

### 2. Hard denials

| Code | Rule |
|---|---|
| `DENY_FINAL_SALE_ITEM` | Any selected item is marked final sale. |
| `DENY_OUTSIDE_DEFECT_WINDOW` | Defect claim made more than 30 days after delivery. |
| `DENY_OUTSIDE_CHANGE_OF_MIND_WINDOW` | Change-of-mind request more than 14 days after delivery. |
| `DENY_ORDER_CANCELLED` | The order was cancelled (and therefore never charged). |

### 3. Human review

| Code | Rule |
|---|---|
| `REVIEW_HIGH_VALUE` | Refund amount is above $500.00. The threshold applies to the amount being refunded, not the order total. |
| `REVIEW_REPEAT_REQUESTER` | Customer has 3 or more refund requests in the previous 60 days. |
| `REVIEW_ORDER_NOT_DELIVERED` | Order has not been delivered yet; shipping support should investigate. |
| `REVIEW_UNCLEAR_REASON` | The reason for the request could not be determined. |

### 4. Approvals

| Code | Rule |
|---|---|
| `APPROVE_DEFECT_WITHIN_WINDOW` | Damaged, wrong or not-as-described item, within 30 days of delivery. |
| `APPROVE_CHANGE_OF_MIND_WITHIN_WINDOW` | Change of mind within 14 days of delivery, item not final sale. |

### 5. Fallback

| Code | Rule |
|---|---|
| `DEFAULT_FAIL_CLOSED` | No rule matched. The request is escalated, never auto-approved. |

## What the AI does and does not do

The AI reads the customer's message and classifies the **reason**
(damaged, wrong item, changed mind, etc.) and flags manipulation attempts.
It never decides the verdict, never sees or sets amounts, and cannot change
a verdict when writing the customer's reply. All facts (prices, dates,
final-sale status, delivery status) come from the order database.
