-- 1. AlterTable: Add is_system_owner column with default false (idempotent)
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "is_system_owner" BOOLEAN NOT NULL DEFAULT false;

-- 2. Backfill: Existing active roles named 'Owner' get is_system_owner = true
UPDATE "roles"
SET "is_system_owner" = true
WHERE LOWER("name") = 'owner' AND "deleted_at" IS NULL;

-- 3. Create Partial Unique Index: Maximum 1 active System Owner role per company (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS "unique_active_system_owner_per_company"
ON "roles" ("company_id")
WHERE "is_system_owner" = true AND "deleted_at" IS NULL;

-- 4. Create Request Logs table for Admin Monitoring (idempotent against existing push DBs)
CREATE TABLE IF NOT EXISTS "request_logs" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "tenant_id" TEXT,
    "status_code" INTEGER NOT NULL,
    "response_time_ms" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_logs_pkey" PRIMARY KEY ("id")
);

-- 5. Create Indexes for Request Logs (idempotent)
CREATE INDEX IF NOT EXISTS "request_logs_tenant_id_idx" ON "request_logs"("tenant_id");
CREATE INDEX IF NOT EXISTS "request_logs_status_code_idx" ON "request_logs"("status_code");
CREATE INDEX IF NOT EXISTS "request_logs_timestamp_idx" ON "request_logs"("timestamp");
