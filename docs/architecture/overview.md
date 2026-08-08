---
last_updated: 2026-08-08
status: Active
related_files:
  - apps/tenant-backend/src/app.ts
  - apps/admin-backend/src/app.ts
  - apps/tenant-backend/prisma/schema.prisma
  - apps/admin-backend/prisma/schema.prisma
---

# Architecture Overview - Nexora ERP

## Architecture Diagram & Core Components

Nexora ERP is structured as a multi-app monorepo separating **Tenant Operations** from **Platform Admin Operations**:

1. **Tenant Backend (`apps/tenant-backend`)**:
   - Primary multi-tenant ERP system serving customer operations (inventory, finance, purchases, sales, production, etc.).
   - Database: Dedicated PostgreSQL database (`nexora_erp_backend`).
   - Tenant isolation model: Strict `company_id` foreign keys on all business records.

2. **Admin Backend (`apps/admin-backend`)**:
   - Platform management system for Nexora Superadmins and support personnel.
   - Database: Dedicated, isolated PostgreSQL database (`nexora_admin_db`) storing Superadmin user credentials and platform configuration.

3. **Tenant Frontend (`apps/tenant-frontend`)**:
   - Single Page Application (React) for business users accessing tenant ERP features.

## Inter-Service Communication

To maintain database isolation and security boundaries, `admin-backend` **does not connect directly to the tenant database**.

Instead, monitoring and analytics data is queried via an **Internal REST API**:
- `tenant-backend` exposes isolated internal endpoints under `/api/v1/internal/*`.
- `admin-backend` communicates with `tenant-backend` over HTTP using a shared `INTERNAL_API_KEY` header (`X-Internal-Secret`).
- Data returned over this channel is strictly scoped to technical metadata (request counts, error metrics, company names, user counts) without exposing confidential tenant business data.
