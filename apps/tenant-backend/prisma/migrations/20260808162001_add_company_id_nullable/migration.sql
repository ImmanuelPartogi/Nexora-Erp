-- Migration 1: Add company_id column as NULLABLE to stocks, stock_movements, documents, approvals

-- AlterTable
ALTER TABLE "stocks" ADD COLUMN "company_id" TEXT;
ALTER TABLE "stock_movements" ADD COLUMN "company_id" TEXT;
ALTER TABLE "documents" ADD COLUMN "company_id" TEXT;
ALTER TABLE "approvals" ADD COLUMN "company_id" TEXT;

-- CreateIndex
CREATE INDEX "stocks_company_id_idx" ON "stocks"("company_id");
CREATE INDEX "stock_movements_company_id_idx" ON "stock_movements"("company_id");
CREATE INDEX "documents_company_id_idx" ON "documents"("company_id");
CREATE INDEX "approvals_company_id_idx" ON "approvals"("company_id");
