# 🔍 NEXORA ERP — SMART CODE AUDIT REPORT

---

## 📊 RINGKASAN EKSEKUTIF

**Project:** Nexora ERP
**Tech Stack:** Node.js, Express 4, TypeScript 5, Prisma 6 (MySQL), Zod 4, JWT, bcrypt, Helmet | React 18, Vite 5, TypeScript 5, TailwindCSS, React Router, Zustand, React Hook Form, Axios
**Total File Dianalisis:** ~25 file inti dibaca langsung dari ~140 file sumber (backend + frontend, diluar `node_modules`/`dist`)
**Tanggal Audit:** 23 Juni 2026

### Scorecard

| Kategori | Skor (1-10) | Status |
|----------|-------------|--------|
| Keamanan | 5.5 | 🟡 |
| Kualitas Kode | 5.0 | 🟡 |
| Performa | 7.0 | 🟢 |
| Test Coverage | 1.0 | 🔴 |
| Dokumentasi | 8.0 | 🟢 |
| **RATA-RATA** | **5.3** | 🟡 |

> 🔴 < 5 = Perlu segera diperbaiki | 🟡 5-7 = Perlu perhatian | 🟢 8-10 = Baik

**Kesimpulan 1 kalimat:** Arsitektur modular multi-tenant yang solid dengan dokumentasi dan middleware security yang rapi, namun terdapat celah secrets management, duplikasi frontend masif, repository yang tidak tenant-safe secara defensif, dan **nol test coverage** yang harus segera diatasi sebelum production.

---

## 🚨 TEMUAN KRITIS (Harus Diperbaiki Segera)

```
[KRIT-001] Secrets & Credentials Ter-Commit di Repo
📁 Lokasi: backend/.env:5,6
⚠️  Risiko: JWT_SECRET="change-this-secret" (lemah, <32 char) dan
    DATABASE_URL memakai user "root" dengan password KOSONG.
    Walaupun .gitignore melarang .env, file ini hadir di working tree
    dan rentan ter-commit/ter-leak. Jika secret JWT ini dipakai di
    production, attacker bisa mem-forgery token apa pun.
🔧 Solusi:
    1. Generate JWT_SECRET baru: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
    2. Gunakan DB user terbatas (bukan root) dengan password kuat.
    3. Rotasi secret, revoke semua token lama.
    4. Pastikan .env TIDAK PERNAH di-commit (verifikasi via `git check-ignore`).
    5. Tambahkan pre-commit hook (e.g. git-secrets / gitleaks).
```

```
[KRIT-002] Zero Test Coverage
📁 Lokasi: (seluruh repo — tidak ada file *.test.ts / *.spec.ts)
⚠️  Risiko: Tidak ada satu pun unit/integration/e2e test. Setiap refactor
    atau bugfix berisiko breaking change tanpa peringatan. Logika finansial
    (transaction.approve, stock movement) berjalan tanpa verifikasi otomatis.
🔧 Solusi:
    1. Tambah vitest/jest di backend + frontend.
    2. Prioritas: unit test untuk TransactionService, StockService.movement,
       AuthService, permission.middleware, dan Zod schemas.
    3. Tambah integration test (supertest) untuk endpoint tenant-scoping.
    4. Target coverage minimum 60% untuk modul core & operations.
```

```
[KRIT-003] Owner Bypass Berbasis Nama Role (Privilege Escalation Vector)
📁 Lokasi: backend/src/shared/middleware/permission.middleware.ts:45-53
⚠️  Risiko: `checkPermission` memberi akses penuh jika ada CompanyUser
    dengan `role.name === 'Owner'`. Karena roles di-scope per-company dan
    pembuatan role diizinkan (permission-gated), jika endpoint pembuatan
    role memperbolehkan nama "Owner", user non-owner bisa membuat role
    "Owner" di company-nya sendiri → escalasi ke akses penuh.
🔧 Solusi:
    1. Tambahkan flag eksplisit di tabel Role: `isSystemOwner Boolean @default(false)`.
    2. Cek `role.isSystemOwner` alih-alih `role.name === 'Owner'`.
    3. Validasi di role-create endpoint: tolak nama "Owner" / "owner" (case-insensitive)
       dan hanya seeding yang boleh membuat system owner.
```

---

## ⚡ ACTION PLAN

### Minggu 1 (Quick Wins — dampak tinggi, usaha rendah)

| # | Tindakan | File Terdampak | Estimasi Waktu |
|---|----------|---------------|----------------|
| 1 | Rotasi `JWT_SECRET`, hapus `.env` dari working tree, gunakan DB user non-root | `backend/.env`, `backend/.env.example` | 0.5 hari |
| 2 | Tambah `backend/.env` ke tracking protection & install pre-commit secret scanner | root (`.husky/`, gitleaks) | 0.5 hari |
| 3 | Perbaiki mismatch env var frontend: client baca `VITE_API_URL` tapi README/example menyebut `VITE_API_BASE_URL` | `frontend/src/shared/api/client.ts:15`, README | 0.5 jam |
| 4 | Hapus build artifacts yang ter-commit: `backend/dist/`, `frontend/dist/` | repo root | 0.5 jam |
| 5 | Naikkan bcrypt salt rounds 10 → 12 | `backend/src/shared/utils/hash.util.ts:4` | 0.5 jam |

### Bulan 1 (Perbaikan Penting)

| # | Tindakan | Dampak | Estimasi Waktu |
|---|----------|--------|----------------|
| 1 | Buat repository `update`/`softDelete` tenant-safe: tambah `companyId` ke `where` clause (gunakan `updateMany` atau `findFirst`+guard) | Mencegah IDOR cross-tenant jika service guard terlewati | 2-3 hari |
| 2 | Tambah kolom `companyId` ke model `Stock`, `StockMovement`, `Approval`, `Document` + migration + scope query | Isolasi tenant konsisten, hilangkan join-through-warehouse | 3-4 hari |
| 3 | Ganti owner-bypass berbasis nama → flag `isSystemOwner` | Tutup vektor privilege escalation | 1 hari |
| 4 | Konsolidasi: hapus duplikat `frontend/src/shared/components/*` (10 file), arahkan semua import ke `components/ui/` | Kurangi ~800 LOC duplikat | 1 hari |
| 5 | Setup testing framework (vitest + supertest) + tulis test untuk AuthService, permission middleware, transaction approve | Dasar confidence refactor | 4-5 hari |

### 3-6 Bulan (Peningkatan Jangka Panjang)

| # | Tindakan | Manfaat | Kompleksitas |
|---|----------|---------|--------------|
| 1 | Bangun generic data-fetch hook (`useResource<T>`) untuk mengganti 14+ hook duplikat | Konsistensi + maintainability | M |
| 2 | Refactor List Pages pakai `ui/` library (Table, Modal, EmptyState, Skeleton) alih-alih inline style/SVG | Konsistensi visual, -3000 LOC | L |
| 3 | Implementasi caching permission per-request (cache hasil `checkPermission` di `req` object) | Kurangi 2 query DB per authorized request | S |
| 4 | Migrasi token dari localStorage → httpOnly secure cookie (CSRF token pairing) | Mitigasi XSS token theft | M |
| 5 | Tambah soft-delete global Prisma middleware + filter otomatis | Konsistensi `deletedAt` handling | M |

---

## 🏗️ ARSITEKTUR

```
Nexora-Erp/
├── backend/                  Express + Prisma (MySQL)
│   ├── prisma/schema.prisma  25+ model, UUID, multi-tenant, soft-delete
│   ├── src/
│   │   ├── app.ts            helmet → cors → rate-limit → body parser → routes → 404 → errorHandler
│   │   ├── routes.ts         registrasi router per domain
│   │   ├── config/           env.ts (validasi), jwt.ts, database.ts
│   │   ├── modules/
│   │   │   ├── core/         auth, user, role, permission, audit, code, company
│   │   │   ├── data/         customer, vendor, product, employee, asset, location
│   │   │   ├── operations/   transaction, stock, lease, production, warehouse
│   │   │   └── reporting/    report (dashboard + custom report)
│   │   └── shared/           db(prisma), errors, middleware, types, utils, constants
│   └── dist/                 ⚠️ build artifacts (sebaiknya di-gitignore)
└── frontend/                 React 18 + Vite + Tailwind
    └── src/
        ├── app/              App shell, router, ProtectedRoute, PermissionGate
        ├── modules/          mirror backend (core/data/operations/reporting)
        │   └── <entity>/{pages,components,hooks,<entity>.schema}.tsx
        └── shared/
            ├── api/          client.ts (axios interceptor) + 17 *.api.ts
            ├── components/   ⚠️ 10 duplikat
            ├── components/ui/ UI library lengkap (tidak terpakai optimal)
            ├── store/        zustand: auth.store, company.store
            ├── hooks/        usePermission
            └── types/        shared DTO types
```

**Request flow (data-scoped):**
```
Client (Axios + JWT in localStorage + X-Company-Id header)
   → helmet → cors → rateLimit → jsonParser
      → authenticate (verify JWT → load req.user)
         → requireCompany (verify company access → set req.activeCompanyId)
            → authorize(PERM) (check role permissions, owner bypass)
               → validateBody (Zod)
                  → auditLog (capture response)
                     → controller → service → repository (Prisma)
                        → errorHandler (ZodError/AppError/Prisma normalize)
```

**Kekuatan:**
- Arsitektur modular berlapis konsisten (routes→controller→service→repository→types→validation) — sangat maintainable.
- Middleware security composition yang benar & lengkap (helmet, CORS lock, rate-limit, JWT, RBAC per-endpoint, audit log).
- Multi-tenancy di-enforce di hampir semua query (`companyId` filter + `deletedAt: null`).
- Error handling global yang matang: ZodError → 422 field-keyed, Prisma code mapping (P2002/P2025/P2003), redaksi field sensitif di log.
- Permission-scoped dashboard (`report.service.ts`) — hanya menjalankan query yang user diizinkan lihat.
- Dukungan transaksi Prisma (`$transaction`) untuk operasi atomik (register, stock movement).
- Soft-delete + audit trail + auto-generated code (`CodeService`) terpusat.

**Kelemahan:**
- Isolasi tenant tidak konsisten: `Stock`/`StockMovement`/`Approval`/`Document`/`Notification` **tidak punya** `companyId` di schema.
- Repository `update`/`softDelete` menerima `companyId` tapi **tidak memakainya** di `where` clause (defense-in-depth lemah).
- Frontend: duplikasi masif (komponen UI ganda, hook fetch ganda, list page inline-style).
- Tidak ada caching permission → 2 DB query per authorized request.
- Token JWT di localStorage (rentan XSS).
- Build artifacts (`dist/`) terbawa di working tree.

**Rekomendasi Arsitektur:**
- Terapkan **Prisma middleware/extension** untuk auto-inject `{ deletedAt: null }` dan (jika memungkinkan) tenant scoping, mengurangi ketergantungan pada disiplin manual per-repository.
- Tambahkan kolom `companyId` ke semua model operasional untuk isolasi tenant yang seragam dan query yang lebih efisien (tanpa join).
- Buat **abstract base repository** generic (`BaseRepository<T>`) sehingga pola CRUD tenant-safe tidak ditulis ulang di tiap modul.
- Di frontend, adopsi **data-fetching library** (TanStack Query) atau generic hook tunggal untuk eliminasi duplikasi + caching/dedup otomatis.

---

## 🔐 KEAMANAN

### Temuan

| ID | Tingkat | Deskripsi | Lokasi | Status |
|----|---------|-----------|--------|--------|
| SEC-001 | KRITIS | `.env` dengan `JWT_SECRET` lemah & DB root no-password hadir di working tree | `backend/.env:5,6` | 🔴 Terbuka |
| SEC-002 | TINGGI | Owner bypass berbasis `role.name === 'Owner'` — vektor privilege escalation | `permission.middleware.ts:45-53` | 🔴 Terbuka |
| SEC-003 | SEDANG | Repository `update`/`softDelete` abaikan `companyId` di `where` (IDOR defensif lemah) | `customer.repository.ts:100,113`; `vendor.repository.ts:79,89` | 🟡 Terbuka |
| SEC-004 | SEDANG | Model `Stock`/`StockMovement`/`Approval`/`Document` tanpa `companyId` (isolasi via join) | `prisma/schema.prisma:487-523,669-720` | 🟡 Terbuka |
| SEC-005 | SEDANG | JWT disimpan di `localStorage` (XSS-exposed) | `auth.store.ts:55`; `client.ts:25` | 🟡 Terbuka |
| SEC-006 | RENDAH | bcrypt salt rounds = 10 (disarankan ≥12 untuk server modern) | `hash.util.ts:4` | 🟢 Terbuka |
| SEC-007 | RENDAH | Rate-limit global `/api` 100/15m; login endpoint spesifik belum punya throttling lebih ketat (brute-force) | `app.ts:35-44` | 🟢 Terbuka |
| SEC-008 | ✅ POSITIF | Helmet, CORS locked, validasi Zod ketat, redaksi field sensitif di log, re-fetch user per request | `app.ts`, `auth.middleware.ts` | 🟢 Baik |

### Rekomendasi Keamanan
1. Rotasi semua secret segera; gunakan DB user least-privilege (bukan root); instal secret scanner pre-commit.
2. Ganti owner-bypass berbasis nama dengan flag `isSystemOwner`; validasi penamaan role di endpoint create.
3. Buat semua repository mutation tenant-safe dengan menambahkan `companyId` ke `where` (gunakan `updateMany` atau pattern `findFirst` → guard).
4. Terapkan throttling lebih ketat pada endpoint `POST /auth/login` (e.g. 5 attempt/menit/IP) terpisah dari rate-limit global.
5. Pertimbangkan migrasi JWT ke httpOnly secure cookie + CSRF token untuk mitigasi XSS token theft jangka panjang.

---

## 💻 KUALITAS KODE

### Masalah Ditemukan

| Jenis | Lokasi | Deskripsi | Prioritas |
|-------|--------|-----------|-----------|
| Duplikasi | `frontend/src/shared/components/*` vs `shared/components/ui/*` | 10 komponen (Button, Input, Select, Modal, Table, Card, Badge, Checkbox, DatePicker, Textarea) ada di 2 tempat (~800 LOC ganda) | Tinggi |
| Duplikasi | `frontend/src/modules/*/hooks/use*.ts` | 14+ hook fetch nyaris identik (useCustomers/useVendors/useProducts/...) — pola state+effect sama, hanya nama berbeda | Tinggi |
| Kompleksitas/Inline | `CustomerListPage.tsx` (384 baris) | Re-implement TH, ModalShell, toast, skeleton inline + inline SVG/styles; abaikan library `ui/` yang sudah ada | Tinggi |
| Anti-Pattern | `CustomerListPage.tsx:86,93,91` | Pakai `alert()`/`confirm()` browser (UX buruk, blocking) padahal ada komponen toast/modal | Sedang |
| Duplikasi | `auth.middleware.ts:56` & `error.middleware.ts:58` | Array `SENSITIVE_FIELDS` + fungsi `sanitizeBody`/sanitizedBody di-duplikasi di 2 file | Sedang |
| Duplikasi | `error.middleware.ts:14` & `validation.middleware.ts:13` | Fungsi `formatZodErrors` di-duplikasi (seharusnya di `shared/errors/zod-error.ts` yang sudah ada) | Sedang |
| Type Safety | `customer.service.ts:96`; `transaction.service.ts:128` | Cast `as any` pada Prisma create input — kehilangan type-check | Rendah |
| Konsistensi | `routes.ts` (404 handler) | `availableRoutes` hardcode list manual + `// ... other routes` — rentan stale | Rendah |

### Peluang Refactoring Utama (Max 5)

```
[REF-001] Generic Resource Hook
📁 Sebelum: frontend/src/modules/*/hooks/use*.ts (14 file × ~50 baris ≈ 700 baris)
✅ Sesudah: 1 hook `useResource<T>(api, params)` + tipis wrapper per-entity (~150 baris)
💡 Manfaat: Konsistensi loading/error/refetch, satu tempat maintenance, fitur abort/dedupe terpusat.
```

```
[REF-002] Konsolidasi Komponen UI
📁 Sebelum: shared/components/* (10 file duplikat) + shared/components/ui/* (library)
✅ Sesudah: Hanya shared/components/ui/*; hapus duplikat; update import path
💡 Manfaat: Hilangkan ambiguitas sumber komponen, -800 LOC, satu source of truth.
```

```
[REF-003] Refactor List Page Pakai UI Library
📁 Sebelum: CustomerListPage.tsx (384 baris, inline style/SVG, TH/ModalShell lokal)
✅ Sesudah: Pakai ui/Table, ui/Modal, ui/EmptyState, ui/LoadingSkeleton, ui/PageContainer (~150 baris)
💡 Manfaat: Konsistensi visual lintas modul, DRY, lebih mudah theming.
```

```
[REF-004] Abstract Base Repository (tenant-safe)
📁 Sebelum: customer.repository.ts, vendor.repository.ts, ... (update/softDelete abaikan companyId)
✅ Sesudah: `BaseRepository<T>` dengan update/delete yang enforce companyId + factory
💡 Manfaat: Defensif terhadap IDOR, DRY, konsistensi soft-delete & audit fields.
```

```
[REF-005] Pusatkan Zod Error Formatter
📁 Sebelum: formatZodErrors duplikat di error.middleware.ts:14 & validation.middleware.ts:13
✅ Sesudah: Ekspor dari shared/errors/zod-error.ts (file sudah ada tapi tak terpakai optimal)
💡 Manfaat: Single source of truth untuk format error validasi.
```

---

## ⚙️ PERFORMA

| Masalah | Lokasi | Dampak | Solusi |
|---------|--------|--------|--------|
| Query permission ganda per request | `permission.middleware.ts:45,55` | 2 DB query di setiap authorized request (owner-check + perm-check) | Cache hasil di `req` object, atau gabung jadi 1 query, atau cache per (userId,companyId) dengan TTL pendek |
| N+1 potensial: report fetch tanpa pagination | `report.service.ts:fetchEntityData` | `findMany` seluruh entity tanpa `take` → bisa ribuan baris untuk report besar | Tambah paginasi/limit + export streaming |
| Stock isolation via join warehouse | `stock.service.ts:27,81,204` | Setiap query stock butuh join ke warehouse→company | Tambah `companyId` langsung di Stock/StockMovement |
| Dev logging query aktif | `prisma.ts:14` | `log:['query']` di development → verbose; pastikan off di prod (sudah conditional) | Sudah OK, verifikasi NODE_ENV di deploy |
| Body parser limit 10mb | `app.ts:49,50` | Limit besar memungkinkan payload besar di-memory | Turunkan ke 1-2mb kecuali endpoint upload khusus |

> Catatan positif: dashboard memakai `Promise.all` untuk paralelisasi query, dan repo `findAll` memakai `Promise.all([findMany,count])` — pola yang baik.

---

## 🧪 TEST COVERAGE

**Coverage Saat Ini:** 0% (Tidak ada file test sama sekali di seluruh repo)
**Target Disarankan:** ≥ 60% untuk modul core & operations; ≥ 40% global

| Jenis Test | Ada? | Kualitas | Catatan |
|------------|------|----------|---------|
| Unit Test | ❌ | — | Tidak ada `*.test.ts`/`*.spec.ts` |
| Integration Test | ❌ | — | Tidak ada supertest/endpoint test |
| E2E Test | ❌ | — | Tidak ada Playwright/Cypress |

**Prioritas Testing:**
1. `permission.middleware.ts` (cek owner bypass + normal permission) — area paling kritis.
2. `AuthService.login/register` (auth flow, hashing, token, company assignment).
3. `TransactionService.approve/update` (logika finansial: larangan ubah amount approved, larangan delete approved).
4. `StockService.movement` (atomicity transaksi, validasi insufficient stock).
5. Middleware tenant isolation: `requireCompany` + repository tenant scoping (pastikan cross-company denied).
6. Zod validation schemas (semua `*.validation.ts`).

---

## 📦 DEPENDENCIES

| Paket | Versi | Status | Aksi |
|-------|-------|--------|------|
| `express` | ^4.22.1 | ✅ OK | Versi 4 stabil; pertimbangkan Express 5 jangka panjang |
| `@prisma/client` / `prisma` | ^6.19.2 | ⚠️ Cek | Versi 6 relatif baru — verifikasi kompatibilitas & changelog breaking changes; root `package.json` masih `^5.22.0` (inkonsisten) |
| `zod` (backend) | ^4.1.13 | ⚠️ Cek | Zod v4 breaking dari v3; frontend pakai `^3.22.4` — **versi beda** antara frontend & backend (risiko inkonsistensi schema) |
| `zod` (frontend) | ^3.22.4 | ⚠️ Outdated relatif backend | Samakan ke v4 atau pertahankan v3 konsisten; validasi @hookform/resolvers compat |
| `bcrypt` | ^6.0.0 | ✅ OK | Pertimbangkan naikkan salt rounds (lihat SEC-006) |
| `helmet` | ^8.1.0 | ✅ Terkini | — |
| `jsonwebtoken` | ^9.0.3 | ✅ OK | — |
| `react` / `react-dom` | ^18.2.0 | ✅ OK | Bisa upgrade ke 18.3+ jika tersedia |
| `vite` | ^5.0.8 | ✅ OK | — |
| `@types/node` (root) | ^25.0.2 | ⚠️ Mismatch | Root pakai ^25, backend pakai ^20 — samakan |
| `eslint` (frontend) | ^9.39.4 | ✅ OK | Flat config (`eslint.config.js`) |

---

## 🔧 SETUP & ENVIRONMENT

```bash
# ── Backend ──────────────────────────────────
cd backend
npm install
cp .env.example .env        # isi DATABASE_URL & JWT_SECRET
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev                 # http://localhost:3000

# ── Frontend ─────────────────────────────────
cd frontend
npm install
# buat frontend/.env dengan:
#   VITE_API_URL=http://localhost:3000/api/v1   ← (catatan: README menyebut VITE_API_BASE_URL — mismatch)
npm run dev                 # http://localhost:5173

# ── Root shortcut ────────────────────────────
npm run dev                 # = npm run dev --prefix backend
```

**Variabel Environment yang Dibutuhkan:**

| Variabel | Diperlukan | Ditemukan Di |
|----------|-----------|--------------|
| `PORT` | Ya | `backend/.env.example` |
| `NODE_ENV` | Ya | `backend/.env.example` |
| `DATABASE_URL` | Wajib | `backend/.env.example`, `backend/.env` ⚠️ |
| `JWT_SECRET` | Wajib (≥32 char di prod) | `backend/.env.example`, `backend/.env` ⚠️ (nilai lemah) |
| `JWT_EXPIRES_IN` | Opsional (default 7d) | `backend/.env.example` |
| `CORS_ORIGIN` | Ya | `backend/.env.example`; `.env` pakai `:3001` (inconsisten dg example `:5173`) |
| `LOG_LEVEL` | Opsional | `backend/.env.example` (dideklarasikan di .env tapi tidak dipakai di `config/env.ts`) |
| `VITE_API_URL` | Ya (frontend) | dipakai di `client.ts` — tapi tidak ada `frontend/.env.example` terdokumentasi |

---

## 📋 CATATAN VERIFIKASI MANUAL

Item berikut **perlu dikonfirmasi** oleh developer karena tidak dapat disimpulkan dari kode:

- [ ] Apakah endpoint `POST /roles` (create role) memvalidasi/menolak nama "Owner"? (terkait SEC-002 / KRIT-003)
- [ ] Apakah `backend/.env` benar-benar sudah pernah ter-push ke remote git? (jalankan `git log --all -- backend/.env` setelah repo di-init)
- [ ] Apakah `CORS_ORIGIN` di production benar-benar terkunci ke domain frontend (bukan wildcard)?
- [ ] Apakah production `NODE_ENV=production` aktif (agar enforce JWT_SECRET ≥32 char & stack trace tersembunyi)?
- [ ] Apakah MySQL di production memakai user least-privilege (bukan root, password kuat)?
- [ ] Apakah ada reverse proxy / WAF di depan API production?
- [ ] Apakah backup database terenkripsi & terjadwal?
- [ ] Apakah refresh-token / revocation list diimplementasikan? (saat ini logout hanya hapus token client-side, token tetap valid server-side sampai exp)
- [ ] Verifikasi behavior `audit.middleware` saat `res.send` dipanggil lebih dari sekali (edge case capture response).
- [ ] Konfirmasi `LOG_LEVEL` (dideklarasik di env tapi tidak dipakai di kode) — apakah ada logger tersembunyi?

---

## LEGENDA

| Simbol | Arti |
|--------|------|
| 🔴 | Kritis / Harus segera diperbaiki |
| 🟡 | Perhatian / Rencanakan perbaikan |
| 🟢 | Baik / Tidak perlu aksi |
| ✅ | Ada / Lulus |
| ❌ | Tidak ada / Gagal |
| S/M/L/XL | Estimasi usaha: Kecil/Sedang/Besar/Sangat Besar |

---

*Dihasilkan oleh: Smart Code Audit Prompt v1.0*
*Semua temuan berbasis kode nyata — Zero hallucination policy*