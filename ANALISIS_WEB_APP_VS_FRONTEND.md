# 📊 Analisis Kekurangan `web-app` dibandingkan `frontend`

> **Referensi:** `frontend` adalah project yang dianggap "sudah bagus" dan menjadi acuan.
> **Target:** `web-app` adalah project yang dianalisis kekurangannya.
> **Tanggal Analisis:** 25 Juni 2026

---

## 📑 Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Kekurangan Konfigurasi & Tooling](#2-kekurangan-konfigurasi--tooling)
3. [Kekurangan Struktur Folder & Organisasi](#3-kekurangan-struktur-folder--organisasi)
4. [Kekurangan Fitur & Modul](#4-kekurangan-fitur--modul)
5. [Kekurangan UI Component Library](#5-kekurangan-ui-component-library)
6. [Kekurangan Sistem Permission & RBAC](#6-kekurangan-sistem-permission--rbac)
7. [Kekurangan Validasi Form & Schema](#7-kekurangan-validasi-form--schema)
8. [Kekurangan State Management](#8-kekurangan-state-management)
9. [Kekurangan API Layer](#9-kekurangan-api-layer)
10. [Kekurangan Layout & Navigasi](#10-kekurangan-layout--navigasi)
11. [Kekurangan Routing](#11-kekurangan-routing)
12. [Kekurangan Hooks Pattern](#12-kekurangan-hooks-pattern)
13. [Kekurangan Dokumentasi](#13-kekurangan-dokumentasi)
14. [Ringkasan Tabel Perbandingan](#14-ringkasan-tabel-perbandingan)
15. [Rekomendasi Prioritas Perbaikan](#15-rekomendasi-prioritas-perbaikan)

---

## 1. Ringkasan Eksekutif

`web-app` adalah aplikasi **mobile-first** (bottom navigation, layout sempit), sedangkan `frontend` adalah aplikasi **desktop ERP** yang lengkap. Secara kematangan, `web-app` jauh tertinggal dari `frontend` dalam hal:

- 🔴 **Kelengkapan fitur** (5 modul vs 16+ modul)
- 🔴 **Tooling & quality assurance** (tidak ada ESLint)
- 🔴 **Sistem keamanan** (tidak ada permission/RBAC)
- 🔴 **Validasi form** (tidak ada schema per modul)
- 🔴 **Komponen UI reusable** (7 vs 17 komponen)
- 🔴 **Ketegasan TypeScript** (config lebih longgar)

---

## 2. Kekurangan Konfigurasi & Tooling

### 2.1 🔴 Tidak Ada ESLint

| Item | `frontend` | `web-app` |
|------|-----------|-----------|
| ESLint config | ✅ `eslint.config.js` | ❌ **Tidak ada** |
| Plugin `react-hooks` | ✅ Ada | ❌ Tidak ada |
| Plugin `react-refresh` | ✅ Ada | ❌ Tidak ada |
| Plugin `typescript-eslint` | ✅ Ada | ❌ Tidak ada |
| Script `lint` di package.json | ✅ `"lint": "eslint . ..."` | ❌ Tidak ada |

**File yang hilang di `web-app`:**
- `eslint.config.js` — tidak ada sama sekali

**Dampak:** `web-app` rentan terhadap:
- Violation aturan React Hooks (dependency array, rules of hooks)
- Dead code / unused imports tidak terdeteksi
- Tidak ada standar code quality yang ditegakkan

---

### 2.2 🔴 TypeScript Configuration Kurang Ketat

Perbandingan `tsconfig.json`:

| Flag Strictness | `frontend` | `web-app` |
|----------------|-----------|-----------|
| `target` | `ES2022` | `ES2020` (lebih lama) |
| `noImplicitAny` | ✅ `true` | ❌ Tidak diatur |
| `strictNullChecks` | ✅ `true` | ⚠️ Hanya via `strict` |
| `strictFunctionTypes` | ✅ `true` | ❌ Tidak diatur |
| `strictBindCallApply` | ✅ `true` | ❌ Tidak diatur |
| `strictPropertyInitialization` | ✅ `true` | ❌ Tidak diatur |
| `noImplicitThis` | ✅ `true` | ❌ Tidak diatur |
| `alwaysStrict` | ✅ `true` | ❌ Tidak diatur |
| `noImplicitReturns` | ✅ `true` | ❌ Tidak diatur |
| `forceConsistentCasingInFileNames` | ✅ `true` | ❌ Tidak diatur |
| `esModuleInterop` | ✅ `true` | ❌ Tidak diatur |
| `allowJs` | ✅ `false` (eksplisit) | ❌ Tidak diatur |
| `exclude` | ✅ `["node_modules", "dist"]` | ❌ Tidak ada |

**Dampak:** Type safety `web-app` jauh lebih lemah → potensi bug runtime lebih tinggi.

---

### 2.3 🟡 Split tsconfig Tidak Ada

`frontend` memisahkan konfigurasi:
- `tsconfig.json` (root)
- `tsconfig.app.json` (untuk source app)
- `tsconfig.node.json` (untuk Node context seperti vite.config.ts)

`web-app` hanya punya satu `tsconfig.json` (plus `tsconfig.node.json` minimal).

---

### 2.4 🟡 Inkonistensi Theme Color

| Project | Nama Warna | Palet |
|---------|-----------|-------|
| `frontend` | `primary` | Sky blue (`#0ea5e9`) |
| `web-app` | `brand` | Indigo (`#6366f1`) |

**Dampak:** Inkonsistensi branding antar dua client app untuk produk yang sama.

---

## 3. Kekurangan Struktur Folder & Organisasi

### 3.1 🔴 Tidak Ada Pemisahan Domain per Modul

**Struktur `frontend` (BAIK):**
```
src/modules/
├── core/          ← modul inti sistem
│   ├── auth/
│   ├── dashboard/
│   ├── role/
│   ├── code/
│   └── audit/
├── data/          ← master data
│   ├── customer/
│   ├── vendor/
│   ├── product/
│   ├── asset/
│   ├── location/
│   └── employee/
├── operations/    ← modul operasional
│   ├── lease/
│   ├── stock/
│   ├── transaction/
│   ├── warehouse/
│   └── production/
└── reporting/     ← laporan
```

**Struktur `web-app` (KURANG):**
```
src/modules/
├── auth/
├── dashboard/
├── profile/
├── stock/
└── transaction/
```
Semua file flat dalam satu folder per modul — tidak ada grouping domain.

---

### 3.2 🔴 Tidak Ada Sub-folder Standar per Modul

Setiap modul di `frontend` mengikuti pola konsisten:
```
transaction/
├── transaction.schema.ts      ← Zod schema
├── pages/
│   ├── TransactionListPage.tsx
│   └── TransactionDetailPage.tsx
├── components/
│   └── TransactionForm.tsx
└── hooks/
    └── useTransactions.ts
```

Di `web-app`, modul `transaction` hanya berisi file flat:
```
transaction/
├── transaction.api.ts
├── TransactionDetailPage.tsx
└── TransactionListPage.tsx
```
**Tidak ada:** `pages/`, `components/`, `hooks/`, `*.schema.ts`.

---

### 3.3 🟡 Tidak Ada Folder `constants/`, `styles/`, `assets/`, `public/`

| Folder | `frontend` | `web-app` |
|--------|-----------|-----------|
| `shared/constants/` | ✅ Ada (permissions.ts, permissionLabels.ts) | ❌ Tidak ada |
| `styles/` | ✅ Ada | ❌ Tidak ada |
| `assets/` | ✅ Ada (react.svg) | ❌ Tidak ada |
| `public/` | ✅ Ada (vite.svg) | ❌ Tidak ada |

---

## 4. Kekurangan Fitur & Modul

### 4.1 🔴 Selisih Modul Sangat Besar

| Modul | `frontend` | `web-app` |
|-------|-----------|-----------|
| Auth (Login) | ✅ | ✅ |
| Register | ✅ | ❌ **Tidak ada** |
| Select Company | ✅ | ❌ **Tidak ada** |
| Dashboard | ✅ | ✅ |
| Customer | ✅ (List + Detail) | ❌ **Tidak ada** |
| Vendor | ✅ (List + Detail) | ❌ **Tidak ada** |
| Product | ✅ (List + Detail) | ❌ **Tidak ada** |
| Asset | ✅ (List + Detail) | ❌ **Tidak ada** |
| Location | ✅ (List + Detail) | ❌ **Tidak ada** |
| Employee | ✅ (List + Detail) | ❌ **Tidak ada** |
| Lease | ✅ (List + Detail) | ❌ **Tidak ada** |
| Stock | ✅ (List + Movement) | ⚠️ Hanya List |
| Transaction | ✅ (List + Detail) | ✅ |
| Warehouse | ✅ | ❌ **Tidak ada** |
| Production | ✅ | ❌ **Tidak ada** |
| Reporting | ✅ | ❌ **Tidak ada** |
| Role Management | ✅ | ❌ **Tidak ada** |
| Code Config | ✅ | ❌ **Tidak ada** |
| Audit Log | ✅ | ❌ **Tidak ada** |
| Profile | ❌ | ✅ (hanya di web-app) |

**Total:** `frontend` memiliki **16+ modul fungsional** vs `web-app` hanya **5 modul**.

---

### 4.2 🔴 Tidak Ada Fitur Create/Edit/Delete (CRUD)

Di `frontend`, modul seperti `TransactionListPage` punya:
- Tombol "Tambah Transaksi"
- Modal form create
- Tombol approve
- Toast notification sukses/gagal

Di `web-app`, `TransactionListPage` hanya:
- Read-only list (hanya view)
- Tidak ada tombol create/edit/delete
- Tidak ada action approve

---

## 5. Kekurangan UI Component Library

### 5.1 🔴 Komponen UI Sangat Terbatas

| Komponen | `frontend` (`ui/`) | `web-app` (`components/`) |
|----------|-------------------|--------------------------|
| Button | ✅ | ❌ |
| Input | ✅ | ❌ |
| Select | ✅ | ❌ |
| Textarea | ✅ | ❌ |
| Checkbox | ✅ | ❌ |
| DatePicker | ✅ | ❌ |
| Modal | ✅ | ❌ |
| Table | ✅ | ❌ |
| Card | ✅ | ❌ |
| Badge | ✅ | ❌ |
| PageContainer | ✅ | ❌ |
| SectionHeader | ✅ | ❌ |
| FormSection | ✅ | ❌ |
| DataTableWrapper | ✅ | ❌ |
| EmptyState | ✅ (di ui/) | ✅ (terpisah) |
| LoadingSkeleton | ✅ (5 varian) | ⚠️ Hanya LoadingSpinner |
| Barrel Export (`index.ts`) | ✅ Ada | ❌ Tidak ada |
| BottomNav | ❌ | ✅ |
| PullToRefresh | ❌ | ✅ |
| PageHeader | ❌ | ✅ |
| StatusBadge | ❌ | ✅ |
| Icons | ❌ | ✅ |

**Dampak:** `web-app` tidak punya form components reusable → harus bikin styling manual di setiap halaman → duplikasi kode.

---

### 5.2 🔴 Tidak Ada Barrel Export

`frontend` punya `shared/components/ui/index.ts` untuk import terpusat:
```ts
import { Button, Input, Modal, Table } from '@/shared/components/ui';
```

`web-app` harus import path penuh per komponen:
```ts
import { PageHeader } from '../../shared/components/PageHeader';
import { EmptyState } from '../../shared/components/EmptyState';
// ... berulang
```

---

## 6. Kekurangan Sistem Permission & RBAC

### 6.1 🔴 Tidak Ada Permission System Sama Sekali

`frontend` punya sistem permission lengkap:

| Komponen/Hook | `frontend` | `web-app` |
|---------------|-----------|-----------|
| `shared/constants/permissions.ts` | ✅ (111 baris, 60+ permission keys) | ❌ **Tidak ada** |
| `shared/constants/permissionLabels.ts` | ✅ | ❌ |
| `shared/hooks/usePermission.ts` | ✅ (`usePermission`, `usePermissions`) | ❌ |
| `app/PermissionGate.tsx` | ✅ (conditional render by permission) | ❌ |

**File permission di `frontend`:**
```ts
export const PERMISSIONS = {
  CUSTOMER_VIEW: 'data.customer.view',
  CUSTOMER_CREATE: 'data.customer.create',
  TRANSACTION_APPROVE: 'operations.transaction.approve',
  // ... 60+ keys
} as const;
```

**Dampak:** Di `web-app`, semua user bisa melihat semua menu tanpa pembatasan role. Tidak ada kontrol akses di level UI.

---

### 6.2 🔴 Navigasi Tidak Filter by Permission

Di `frontend`, `Layout.tsx` memfilter menu berdasarkan:
```ts
const visibleItems = group.items.filter((item) =>
  hasPerm(permissions, item.perm, isOwner)
);
```

Di `web-app`, `BottomNav.tsx` menampilkan semua menu tanpa filter permission.

---

## 7. Kekurangan Validasi Form & Schema

### 7.1 🔴 Tidak Ada Zod Schema per Modul

`frontend` punya schema validasi per modul:

| File Schema | `frontend` | `web-app` |
|-------------|-----------|-----------|
| `auth/auth.schema.ts` | ✅ | ❌ |
| `role/role.schema.ts` | ✅ | ❌ |
| `lease/lease.schema.ts` | ✅ | ❌ |
| `production/production.schema.ts` | ✅ | ❌ |
| `stock/stock.schema.ts` | ✅ | ❌ |
| `transaction/transaction.schema.ts` | ✅ | ❌ |
| `customer/customer.schema.ts` | ✅ | ❌ |
| `employee/employee.schema.ts` | ✅ | ❌ |
| `asset/asset.schema.ts` | ✅ | ❌ |
| `location/location.schema.ts` | ✅ | ❌ |
| `product/product.schema.ts` | ✅ | ❌ |

Contoh schema di `frontend`:
```ts
export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  // ...
});
```

**Dampak:** `web-app` tidak punya validasi client-side yang terstandar → data invalid bisa dikirim ke backend.

---

### 7.2 🔴 Tidak Ada Pattern Form dengan react-hook-form + zodResolver

`frontend` menggunakan pola konsisten:
```tsx
const { register, handleSubmit, formState: { errors } } =
  useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction ?? { type: 'income' },
  });
```

`web-app` tidak punya komponen Form apa pun yang menggunakan pola ini.

---

## 8. Kekurangan State Management

### 8.1 🟡 Tidak Ada Pemisahan Auth Store dan Company Store

| Store | `frontend` | `web-app` |
|-------|-----------|-----------|
| `auth.store.ts` | ✅ (auth + user) | ✅ (auth + user + company + permissions) |
| `company.store.ts` | ✅ (active company + permissions + `hasPermission`) | ❌ **Tidak ada** |

**Dampak:** `web-app` mencampur concerns (auth + company + permissions) dalam satu store → melanggar Single Responsibility Principle.

---

### 8.2 🟡 Tidak Ada Method `hasPermission` di Store

`frontend` punya:
```ts
hasPermission: (permission) => {
  const { permissions } = get();
  return permissions.includes(permission);
}
```

`web-app` tidak punya helper ini → cek permission sulit dilakukan.

---

### 8.3 🟡 Perbedaan Strategi Persistensi

| Aspek | `frontend` | `web-app` |
|-------|-----------|-----------|
| Strategi | Manual `localStorage.setItem/getItem` di setiap action | `zustand/middleware` `persist` |
| Synchronous init | ✅ (`getInitialState()` anti race-condition) | ⚠️ Mengandalkan hydratasi async |
| `isAuthenticated` flag | ✅ Eksplisit | ❌ Tidak ada (harus cek `token !== null`) |

**Catatan:** `web-app` sebenarnya punya pendekatan yang lebih clean (persist middleware), tapi `frontend` punya komentar eksplisit tentang penanganan race condition.

---

## 9. Kekurangan API Layer

### 9.1 🔴 Jumlah API File Sangat Sedikit

| API File | `frontend` | `web-app` |
|----------|-----------|-----------|
| `client.ts` | ✅ | ✅ |
| `auth.api.ts` | ✅ | ✅ |
| `asset.api.ts` | ✅ | ❌ |
| `audit.api.ts` | ✅ | ❌ |
| `code-config.api.ts` | ✅ | ❌ |
| `customer.api.ts` | ✅ | ❌ |
| `employee.api.ts` | ✅ | ❌ |
| `lease.api.ts` | ✅ | ❌ |
| `location.api.ts` | ✅ | ❌ |
| `product.api.ts` | ✅ | ❌ |
| `production.api.ts` | ✅ | ❌ |
| `report.api.ts` | ✅ | ❌ |
| `role.api.ts` | ✅ | ❌ |
| `stock.api.ts` | ✅ | ✅ |
| `transaction.api.ts` | ✅ | ✅ |
| `vendor.api.ts` | ✅ | ❌ |
| `warehouse.api.ts` | ✅ | ❌ |

**Total:** `frontend` 16 file API vs `web-app` hanya 3 file.

---

### 9.2 🟡 API Client Tidak Mendukung AxiosRequestConfig di Semua Method

`frontend` `client.ts` mendukung config penuh:
```ts
async get<T>(url: string, params?: QueryParams): Promise<T>;
async get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;  // overload
```

`web-app` lebih terbatas — `get()` hanya menerima params, tidak ada overload untuk `signal`, custom headers, dll (kecuali `post` yang sudah mendukung config).

**Kelebihan `web-app`:** punya method `getMessage()` untuk error handling yang baik (tidak ada di `frontend`).

---

## 10. Kekurangan Layout & Navigasi

### 10.1 🔴 Tidak Ada Layout Desktop ERP

`frontend` punya `Layout.tsx` (756 baris) yang sophisticated:
- Header dengan gradient dark
- Brand logo NEXORA ERP
- Breadcrumb dinamis per route
- Dropdown navigation per group (Data Master, Operasional, Laporan, Sistem)
- Company selector switcher
- Notification bell
- User menu dropdown dengan avatar gradient
- Animasi CSS (`dropIn`, `slideRight`, `menuSlide`, `fadeIn`)

`web-app` menggunakan layout mobile:
- Bottom navigation (`BottomNav.tsx`)
- Layout simple `flex min-h-screen flex-col` + `pb-16`

**Catatan:** Ini perbedaan use-case (mobile vs desktop), bukan murni kekurangan. Namun jika tujuannya menyamai `frontend`, maka layout desktop perlu dibuat.

---

### 10.2 🔴 Tidak Ada Company Selector

`frontend` punya company switcher di header:
```tsx
<select onChange={(e) => setActiveCompany(e.target.value)}>
  {companies.map((c) => <option ...>{c.name}</option>)}
</select>
```

`web-app` tidak punya UI untuk switch company.

---

## 11. Kekurangan Routing

### 11.1 🔴 Jumlah Route Sangat Sedikit

| Route | `frontend` | `web-app` |
|-------|-----------|-----------|
| `/login` | ✅ | ✅ |
| `/register` | ✅ | ❌ |
| `/select-company` | ✅ | ❌ |
| `/dashboard` | ✅ | ✅ |
| `/customers` + `/customers/:id` | ✅ | ❌ |
| `/vendors` + `/vendors/:id` | ✅ | ❌ |
| `/products` + `/products/:id` | ✅ | ❌ |
| `/assets` + `/assets/:id` | ✅ | ❌ |
| `/locations` + `/locations/:id` | ✅ | ❌ |
| `/employees` + `/employees/:id` | ✅ | ❌ |
| `/leases` + `/leases/:id` | ✅ | ❌ |
| `/stocks` + `/stocks/movements` | ✅ | ⚠️ Hanya `/stock` |
| `/transactions` + `/transactions/:id` | ✅ | ✅ |
| `/purchases` + `/purchases/:id` | ✅ | ❌ |
| `/sales` + `/sales/:id` | ✅ | ❌ |
| `/warehouses` | ✅ | ❌ |
| `/production` | ✅ | ❌ |
| `/reports` | ✅ | ❌ |
| `/roles` | ✅ | ❌ |
| `/code-config` | ✅ | ❌ |
| `/audit-logs` | ✅ | ❌ |
| `/profile` | ❌ | ✅ |

---

### 11.2 🟡 Tidak Ada Cek `activeCompanyId` di ProtectedRoute

`frontend`:
```tsx
if (!isAuthenticated) return <Navigate to="/login" replace />;
if (!activeCompanyId) return <Navigate to="/select-company" replace />;
```

`web-app` hanya cek authentication, tidak cek company selection.

---

### 11.3 🟡 Tidak Menggunakan `createBrowserRouter`

`frontend`: `createBrowserRouter` (modern data router API).
`web-app`: `<Routes>` + `<Route>` (legacy API).

---

## 12. Kekurangan Hooks Pattern

### 12.1 🔴 Tidak Ada Custom Hooks per Modul

`frontend` punya hooks terpisah per modul:

| Hook | `frontend` | `web-app` |
|------|-----------|-----------|
| `transaction/hooks/useTransactions.ts` | ✅ | ❌ |
| `stock/hooks/useStock.ts` (dll) | ✅ | ❌ |
| `customer/hooks/useCustomers.ts` (dll) | ✅ | ❌ |
| `role/hooks/useRoles.ts` (dll) | ✅ | ❌ |
| ... (satu per modul) | ✅ | ❌ |

`web-app` hanya punya generic `shared/hooks/useResource.ts` (satu untuk semua).

**Dampak:** Generic hook kehilangan type safety spesifik per entity dan filter params khusus.

---

### 12.2 Komparasi Hook Pattern

`frontend` (spesifik per modul):
```ts
export const useTransactions = (params?: ListQueryParams & { type?: string }) => {
  // ... typed untuk Transaction
};
```

`web-app` (generic):
```ts
// useResource.ts — generic, kurang type-safe untuk entity spesifik
```

---

## 13. Kekurangan Dokumentasi

| Item | `frontend` | `web-app` |
|------|-----------|-----------|
| `README.md` | ✅ Ada | ❌ **Tidak ada** |
| Komentar file header | ✅ Konsisten (`// FILE: ...`) | ✅ Ada |
| `.env.example` | ✅ | ✅ |

---

## 14. Ringkasan Tabel Perbandingan

| Aspek | `frontend` | `web-app` | Selisih |
|-------|-----------|-----------|---------|
| ESLint | ✅ Lengkap | ❌ | 🔴 Kritis |
| TS Strictness | ✅ Maksimal | ⚠️ Minimal | 🔴 Tinggi |
| Jumlah Modul | 16+ | 5 | 🔴 Kritis |
| Permission System | ✅ Lengkap | ❌ | 🔴 Kritis |
| Zod Schema | ✅ 11 file | ❌ 0 | 🔴 Tinggi |
| UI Components | 17 + barrel | 7 tanpa barrel | 🔴 Tinggi |
| API Files | 16 | 3 | 🔴 Tinggi |
| Store Files | 2 (separated) | 1 (combined) | 🟡 Sedang |
| Custom Hooks per Modul | ✅ | ❌ | 🔴 Tinggi |
| Layout Sophistication | Desktop ERP | Mobile simple | 🟡 Sesuai use-case |
| Route Count | 30+ | 6 | 🔴 Kritis |
| CRUD Operations | ✅ Full | ❌ Read-only | 🔴 Kritis |
| Company Selector | ✅ | ❌ | 🟡 Sedang |
| Permission-filtered Nav | ✅ | ❌ | 🔴 Tinggi |
| README | ✅ | ❌ | 🟢 Rendah |

---

## 15. Rekomendasi Prioritas Perbaikan

### 🔴 Prioritas 1 — Kritis (Quality & Security)
1. **Tambahkan ESLint** — copy `eslint.config.js` dari `frontend`, install dependencies, tambah script `lint`.
2. **Tighten `tsconfig.json`** — aktifkan semua strict flags seperti `frontend`.
3. **Buat sistem permission** — port `permissions.ts`, `usePermission.ts`, `PermissionGate.tsx`.

### 🔴 Prioritas 2 — Tinggi (Foundation)
4. **Restrukturisasi modul** — tambahkan `pages/`, `components/`, `hooks/` sub-folder per modul.
5. **Buat UI component library** — port `Button`, `Input`, `Select`, `Modal`, `Table`, dll + `index.ts` barrel.
6. **Tambah Zod schema** per modul untuk validasi form.
7. **Buat custom hooks per modul** (ganti generic `useResource`).

### 🟡 Prioritas 3 — Sedang (Feature Parity)
8. Implementasi modul yang hilang: Customer, Vendor, Product, Asset, Location, Employee, Lease, Warehouse, Production, Reporting, Role, Code Config, Audit Log.
9. Tambahkan operasi CRUD (create/edit/delete) di setiap list page.
10. Pisahkan `company.store.ts` dari `auth.store.ts`.

### 🟢 Prioritas 4 — Rendah (Polishing)
11. Tambah `README.md`.
12. Konsistenkan theme color naming (`brand` vs `primary`).
13. Pertimbangkan migrasi ke `createBrowserRouter`.

---

## Catatan Tambahan

### Hal yang Sudah Baik di `web-app` (tidak perlu ditiru dari frontend):
- ✅ `apiClient.getMessage()` untuk error handling yang baik (tidak ada di `frontend`).
- ✅ Penggunaan `zustand/middleware persist` lebih clean daripada manual localStorage.
- ✅ Lazy loading dengan `React.lazy` + `Suspense` di router (frontend import eager).
- ✅ Komponen mobile-first (`BottomNav`, `PullToRefresh`) — relevan untuk use-case mobile.
- ✅ Infinite scroll dengan `IntersectionObserver` di TransactionListPage.
- ✅ Debounce search input.

### Catatan Kualitas `frontend` yang Perlu Diperhatikan:
- ⚠️ Banyak inline `style={{}}` yang sebaiknya dipindah ke Tailwind classes.
- ⚠️ SVG icons di-repeat di banyak file (Layout.tsx, TransactionListPage.tsx, TransactionForm.tsx) — sebaiknya ekstrak ke Icon library.
- ⚠️ `index.css` masih default Vite template (dark mode styling) — tidak sesuai dengan app yang light-themed.

---

*Analisis ini dibuat berdasarkan eksplorasi struktur direktori dan pembacaan file representatif dari kedua project pada 25 Juni 2026.*