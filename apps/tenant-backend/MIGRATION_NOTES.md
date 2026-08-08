# 📌 NEXORA ERP - MIGRATION & SECURITY AUDIT NOTES

## Tenant Isolation (IDOR Fix) Migration Notes
- **Migration Files Created**:
  1. `20260808162001_add_company_id_nullable`: Adds `company_id` column as `NULLABLE` with indexes on `stocks`, `stock_movements`, `documents`, and `approvals`.
  2. `20260808162002_backfill_company_id_data`: Runs data backfill UPDATE queries for existing records using parent entity joins + PL/pgSQL Guard Check to abort if any orphaned rows exist.
  3. `20260808162003_enforce_company_id_not_null`: Enforces `NOT NULL` constraints and adds foreign key constraints to `companies(id)`.

> ✅ **DEPLOYMENT & VALIDATION STATUS (DATABASE MIGRATION)**:
> Urutan migration 3-langkah di atas **SUDAH DIVALIDASI END-TO-END DI POSTGRESQL 15 (DOCKER)** pada 8 Agustus 2026 dengan hasil sukses 100%, termasuk verifikasi eksekusi guard check PL/pgSQL (0 orphan rows) dan penerapan constraint `NOT NULL` serta FK ke `companies(id)`.
> *Catatan*: Pengujian telah divalidasi pada skema representatif dengan data sintetis berelasi; disarankan tetap melakukan dry-run pada database staging dengan snapshot data production sungguhan sebelum eksekusi di lingkungan production.

---

## Auth Rate Limiter Notes & Known Limitations
- **Current Implementation**: Login rate limiter (`loginLimiter`) is mounted on `POST /api/v1/auth/login` (Max 5 attempts/min per IP + Email combination).
- **Auto-reset**: Upon successful login (`AuthController.login`), the rate-limit hit counter for that `(IP + email)` key is automatically reset.
- **In-Memory Store Known Limitation**: The rate limiter currently uses an **in-memory store** (in-process). Hits reset on application restart and are not shared across process boundaries.
- **Production Multi-Instance Upgrade Path**: When scaling out to a load-balanced / multi-instance deployment, upgrade the store in `rate-limit.middleware.ts` to a shared Redis store (e.g. `rate-limit-redis`).
