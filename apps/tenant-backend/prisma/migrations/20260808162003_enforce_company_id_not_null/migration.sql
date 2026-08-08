-- Migration 3: Enforce NOT NULL constraints and Add Foreign Keys to companies(id)

-- AlterTable Enforce NOT NULL
ALTER TABLE "stocks" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "stock_movements" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "documents" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "approvals" ALTER COLUMN "company_id" SET NOT NULL;

-- AddForeignKeys
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
