-- Migration 2: Safe Data Backfill for company_id across all existing rows (PostgreSQL Dialect)

-- 1. Backfill Stock company_id from Warehouses
UPDATE "stocks"
SET "company_id" = "warehouses"."company_id"
FROM "warehouses"
WHERE "stocks"."warehouse_id" = "warehouses"."id"
  AND "stocks"."company_id" IS NULL;

-- 2. Backfill StockMovement company_id from Warehouses
UPDATE "stock_movements"
SET "company_id" = "warehouses"."company_id"
FROM "warehouses"
WHERE "stock_movements"."warehouse_id" = "warehouses"."id"
  AND "stock_movements"."company_id" IS NULL;

-- 3. Backfill Documents company_id based on Polymorphic Entity Types
UPDATE "documents"
SET "company_id" = "transactions"."company_id"
FROM "transactions"
WHERE "documents"."entity_id" = "transactions"."id"
  AND "documents"."entity_type" = 'transaction'
  AND "documents"."company_id" IS NULL;

UPDATE "documents"
SET "company_id" = "purchases"."company_id"
FROM "purchases"
WHERE "documents"."entity_id" = "purchases"."id"
  AND "documents"."entity_type" = 'purchase'
  AND "documents"."company_id" IS NULL;

UPDATE "documents"
SET "company_id" = "leases"."company_id"
FROM "leases"
WHERE "documents"."entity_id" = "leases"."id"
  AND "documents"."entity_type" = 'lease'
  AND "documents"."company_id" IS NULL;

-- 4. Backfill Approvals company_id based on Target Entity Types (Parent Entity Company)
UPDATE "approvals"
SET "company_id" = "transactions"."company_id"
FROM "transactions"
WHERE "approvals"."entity_id" = "transactions"."id"
  AND "approvals"."entity_type" = 'transaction'
  AND "approvals"."company_id" IS NULL;

UPDATE "approvals"
SET "company_id" = "purchases"."company_id"
FROM "purchases"
WHERE "approvals"."entity_id" = "purchases"."id"
  AND "approvals"."entity_type" = 'purchase'
  AND "approvals"."company_id" IS NULL;

UPDATE "approvals"
SET "company_id" = "productions"."company_id"
FROM "productions"
WHERE "approvals"."entity_id" = "productions"."id"
  AND "approvals"."entity_type" = 'production'
  AND "approvals"."company_id" IS NULL;

UPDATE "approvals"
SET "company_id" = "leases"."company_id"
FROM "leases"
WHERE "approvals"."entity_id" = "leases"."id"
  AND "approvals"."entity_type" = 'lease'
  AND "approvals"."company_id" IS NULL;

-- 5. Safety Guard Check (PL/pgSQL Block)
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_count FROM (
    SELECT id FROM "stocks" WHERE "company_id" IS NULL
    UNION ALL
    SELECT id FROM "stock_movements" WHERE "company_id" IS NULL
    UNION ALL
    SELECT id FROM "documents" WHERE "company_id" IS NULL
    UNION ALL
    SELECT id FROM "approvals" WHERE "company_id" IS NULL
  ) AS orphans;

  IF orphan_count > 0 THEN
    RAISE EXCEPTION 'Backfill incomplete: % row(s) still have NULL company_id. Migration stopped before enforcing NOT NULL. Investigate orphaned rows manually before proceeding.', orphan_count;
  END IF;
END $$;
