import type {
  CustomerOrderDto,
  CustomerSummaryDto,
  DecisionAuditDto,
  RefundListItemDto,
  RefundStatsDto,
  RefundVerdict,
} from "@refund-desk/shared";
import type { ReactNode } from "react";

import type { BadgeTone, DemoHint, FilterOption, ThreadEntry } from "./ui.types";

export interface BadgeProps { tone: BadgeTone; children: ReactNode }
export interface VerdictBadgeProps { verdict: RefundVerdict }
export interface CardProps { title?: string; action?: ReactNode; children: ReactNode }
export interface FieldErrorProps { messages?: string[] }
export interface AlertProps { children: ReactNode }
export interface LayoutProps { children: ReactNode }
export interface ErrorPageProps { error: Error; reset: () => void }

export interface CustomerPickerProps { customers: CustomerSummaryDto[]; selectedId?: string }
export interface ConversationProps { entries: ThreadEntry[] }
export interface RefundRequestPanelProps { customerId: string; orders: CustomerOrderDto[]; hint?: DemoHint }

export interface StatCardsProps { stats: RefundStatsDto }
export interface FilterBarProps { options: FilterOption[] }
export interface RequestsTableProps { rows: RefundListItemDto[] }
export interface DecisionTraceProps { audit: DecisionAuditDto }
export interface TraceStepProps { n: number; title: string; children: ReactNode }
export interface ReviewFormProps { refundId: string }
