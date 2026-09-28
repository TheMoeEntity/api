-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RefundVerdict" AS ENUM ('APPROVED', 'DENIED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('DECIDED', 'PENDING_REVIEW', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ReasonCategory" AS ENUM ('DAMAGED', 'WRONG_ITEM', 'NOT_AS_DESCRIBED', 'NOT_RECEIVED', 'CHANGED_MIND', 'OTHER');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('APPROVE', 'DENY');

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "placedAt" TIMESTAMP(3) NOT NULL,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "isFinalSale" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundRequest" (
    "id" UUID NOT NULL,
    "idempotencyKey" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "reasonCategory" "ReasonCategory",
    "verdict" "RefundVerdict" NOT NULL,
    "status" "RefundStatus" NOT NULL,
    "customerReply" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefundRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundRequestItem" (
    "id" UUID NOT NULL,
    "refundRequestId" UUID NOT NULL,
    "orderItemId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "RefundRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionAudit" (
    "id" UUID NOT NULL,
    "refundRequestId" UUID NOT NULL,
    "extractedClaims" JSONB,
    "injectionSignals" TEXT[],
    "rulesTriggered" TEXT[],
    "decidingRule" TEXT NOT NULL,
    "aiProvider" TEXT NOT NULL,
    "model" TEXT,
    "promptVersion" TEXT,
    "aiFallbackUsed" BOOLEAN NOT NULL DEFAULT false,
    "latencyMs" INTEGER NOT NULL,
    "tokensIn" INTEGER,
    "tokensOut" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecisionAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewAction" (
    "id" UUID NOT NULL,
    "refundRequestId" UUID NOT NULL,
    "decision" "ReviewDecision" NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_customerId_placedAt_idx" ON "Order"("customerId", "placedAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "RefundRequest_idempotencyKey_key" ON "RefundRequest"("idempotencyKey");

-- CreateIndex
CREATE INDEX "RefundRequest_createdAt_idx" ON "RefundRequest"("createdAt");

-- CreateIndex
CREATE INDEX "RefundRequest_status_createdAt_idx" ON "RefundRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "RefundRequest_customerId_createdAt_idx" ON "RefundRequest"("customerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefundRequestItem_refundRequestId_orderItemId_key" ON "RefundRequestItem"("refundRequestId", "orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "DecisionAudit_refundRequestId_key" ON "DecisionAudit"("refundRequestId");

-- CreateIndex
CREATE INDEX "ReviewAction_refundRequestId_createdAt_idx" ON "ReviewAction"("refundRequestId", "createdAt");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequestItem" ADD CONSTRAINT "RefundRequestItem_refundRequestId_fkey" FOREIGN KEY ("refundRequestId") REFERENCES "RefundRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequestItem" ADD CONSTRAINT "RefundRequestItem_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionAudit" ADD CONSTRAINT "DecisionAudit_refundRequestId_fkey" FOREIGN KEY ("refundRequestId") REFERENCES "RefundRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAction" ADD CONSTRAINT "ReviewAction_refundRequestId_fkey" FOREIGN KEY ("refundRequestId") REFERENCES "RefundRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
