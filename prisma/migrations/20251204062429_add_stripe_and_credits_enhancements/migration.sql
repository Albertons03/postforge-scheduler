/*
  Warnings:

  - Added the required column `balanceAfter` to the `CreditTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable - Add metadata column first
ALTER TABLE "CreditTransaction" ADD COLUMN "metadata" JSONB NOT NULL DEFAULT '{}';

-- AlterTable - Add balanceAfter with default value temporarily
ALTER TABLE "CreditTransaction" ADD COLUMN "balanceAfter" INTEGER NOT NULL DEFAULT 0;

-- Update existing rows to have correct balanceAfter values
-- This will set all existing transactions to 0, which we'll fix later with a data migration script if needed
UPDATE "CreditTransaction" SET "balanceAfter" = 0 WHERE "balanceAfter" = 0;

-- CreateTable
CREATE TABLE "StripeTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "stripePaymentId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "credits" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StripeTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "stripeProductId" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "priceInCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StripeTransaction_stripeSessionId_key" ON "StripeTransaction"("stripeSessionId");

-- CreateIndex
CREATE INDEX "StripeTransaction_userId_idx" ON "StripeTransaction"("userId");

-- CreateIndex
CREATE INDEX "StripeTransaction_stripeSessionId_idx" ON "StripeTransaction"("stripeSessionId");

-- CreateIndex
CREATE INDEX "StripeTransaction_status_idx" ON "StripeTransaction"("status");

-- CreateIndex
CREATE INDEX "StripeTransaction_createdAt_idx" ON "StripeTransaction"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PricingPlan_name_key" ON "PricingPlan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PricingPlan_stripePriceId_key" ON "PricingPlan"("stripePriceId");

-- CreateIndex
CREATE INDEX "PricingPlan_isActive_idx" ON "PricingPlan"("isActive");

-- AddForeignKey
ALTER TABLE "StripeTransaction" ADD CONSTRAINT "StripeTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
