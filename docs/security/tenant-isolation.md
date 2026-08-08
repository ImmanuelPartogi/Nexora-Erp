---
last_updated: 2026-08-08
status: Active
related_files:
  - apps/tenant-backend/prisma/schema.prisma
  - apps/tenant-backend/prisma/migrations/20260808162001_add_company_id_nullable
  - apps/tenant-backend/prisma/migrations/20260808162002_backfill_company_id_data
  - apps/tenant-backend/prisma/migrations/20260808162003_enforce_company_id_not_null
  - apps/tenant-backend/src/shared/middleware/rate-limit.middleware.ts
  - apps/tenant-backend/src/shared/middleware/internal-auth.middleware.ts
---

# Security & Tenant Isolation Summary

## 1. Tenant Isolation & IDOR Vulnerability Remediation (Commit 944d081)

- **Issue Resolved**: IDOR vulnerabilities on `stocks`, `stock_movements`, `documents`, and `approvals` where records lacked explicit `company_id` column constraints.
- **Remediation**:
  - Schema updated with mandatory `company_id` columns, indexes, and FK constraints referencing `companies(id)`.
  - Service layers update queries to enforce `companyId` filtering on all CRUD and polymorphic operations.
- **Migration Validation**:
  - Applied a 3-step PostgreSQL migration sequence (`20260808162001`, `20260808162002`, `20260808162003`).
  - Includes a PL/pgSQL guard check block in Migration 2 to verify 0 orphaned records exist before applying `NOT NULL` constraints.
  - Fully validated end-to-end against a live PostgreSQL 15 (Docker) test environment on August 8, 2026.

## 2. Authentication Rate Limiting & Brute-Force Protection

- **Rate Limiter (`loginLimiter`)**:
  - Mounted on `POST /api/v1/auth/login`.
  - Max 5 attempts per 1-minute window per `(IP + email)` key.
  - Automatically resets rate limit hit counters upon successful authentication (`resetLoginRateLimit`).
- **Production Path**:
  - In single-instance setups, uses in-process memory store.
  - For multi-instance load-balanced deployments, store should be upgraded to Redis (`rate-limit-redis`).

## 3. Internal Inter-Service API Security

- **Authentication (`internalAuthMiddleware`)**:
  - Endpoints under `/api/v1/internal/*` are protected using `X-Internal-Secret` header validation.
  - Comparison uses `crypto.timingSafeEqual` to prevent timing attack side channels.
  - Secret key `INTERNAL_API_KEY` is loaded from environment variables and must be at least 32 random bytes.
- **Transport Security Requirements**:
  - For cloud/multi-node deployments, inter-service traffic must run over HTTPS (Private TLS) or **mTLS (Mutual TLS)** via service mesh to ensure encryption in transit.
