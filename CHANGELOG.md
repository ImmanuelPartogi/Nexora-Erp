# Changelog

All notable changes to the Nexora ERP project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Admin Panel Tenant Monitoring & Analytics APIs**:
  - `GET /api/v1/tenants`: List tenant companies and active user counts (`apps/admin-backend/src/routes/tenants.routes.ts`).
  - `GET /api/v1/tenants/:id/stats`: Fetch request count and error metrics for specific tenant.
  - `GET /api/v1/analytics/api-usage`: Retrieve top called API endpoints and average response times (`apps/admin-backend/src/routes/analytics.routes.ts`).
  - `GET /api/v1/analytics/errors`: Retrieve recent 500+ server error requests with tenant and timestamp metadata.
- **Internal Inter-Service Security & Request Logging**:
  - `RequestLog` model in `apps/tenant-backend/prisma/schema.prisma` for lightweight request metadata logging.
  - Inter-service REST API endpoints (`/api/v1/internal/*`) in `tenant-backend` protected by `internalAuthMiddleware` with timing-safe (`crypto.timingSafeEqual`) header authentication (`X-Internal-Secret`).
  - Isolated internal route prefix `/api/v1/internal` separated from public tenant routes.

### Security
- **Remediated KRIT-003 Owner Privilege Escalation Vector**:
  - Added `isSystemOwner` (boolean) flag to `Role` model in `schema.prisma`.
  - Refactored `permission.middleware.ts`, `owner-only.middleware.ts`, and `role.service.ts` to check `role.isSystemOwner === true` instead of string matching `role.name === 'Owner'`.
  - Added strict Zod and service-level validation blocking creation/updating of roles named "Owner" (case-insensitive, trimmed) from public API endpoints.
  - Added 11 automated Vitest unit and integration tests covering system owner bypass logic, regression prevention, and role API validation.

### Known Issues / Technical Debt
- **Frontend Monolithic Bundle Size**: Vite build warning for single bundle chunk (~902 KB minified / ~213 KB gzipped). Route-based code splitting using `React.lazy()` / dynamic `import()` is planned for a future optimization phase.


## [1.1.0] - 2026-08-08 (Commit 944d081)

### Security & Compliance
- **Tenant Isolation & IDOR Vulnerability Remediation**:
  - Added strict `company_id` scoping to database models (`stocks`, `stock_movements`, `documents`, `approvals`).
  - Enforced tenant verification on polymorphic entity lookups across all backend operations.
  - Applied 3-step safe PostgreSQL migration sequence with PL/pgSQL guard check for orphan row detection (`20260808162001`, `20260808162002`, `20260808162003`).
- **Auth Rate Limiting Security Patch**:
  - Implemented IP + Email composite rate limiter (`loginLimiter`) on `POST /api/v1/auth/login` (5 attempts/min).
  - Added automatic hit counter reset upon successful authentication (`resetLoginRateLimit`).
