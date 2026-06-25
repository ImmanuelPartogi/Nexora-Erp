# Nexora ERP – Web App (Mobile Field Console)

Mobile-first React + TypeScript PWA-style console for field operators.
Built with **Vite + React + TailwindCSS + Zustand + React Query + Zod**.

> This app is intentionally **separate** from `/frontend` (the desktop
> admin dashboard). It targets phones/tablets, is touch-optimised, and
> exposes only the subset of ERP features needed on the floor.

---

## ✨ Recent Improvements (Mobile-First Refactor)

Based on `ANALISIS_WEB_APP_VS_FRONTEND.md`, the following upgrades were applied:

### P1 – Tooling & Type Safety
- ✅ **ESLint flat config** (`eslint.config.js`) with React + hooks rules.
- ✅ **`@path` alias** (`@/...`) registered in `tsconfig.json` + `vite.config.ts`.
- ✅ **Stricter `tsconfig`** (`noUncheckedIndexedAccess`, `forceConsistentCasingInFileNames`).
- ✅ **Zod** added for runtime form/query validation.

### P1 – Permission System (RBAC)
- ✅ `shared/constants/permissions.ts` – central permission matrix.
- ✅ `shared/constants/permissionLabels.ts` – human-readable Bahasa labels.
- ✅ `shared/store/auth.store.ts` – stores permissions on login.
- ✅ `shared/hooks/usePermission.ts` – `useHasPermission` + `useCan`.
- ✅ `app/PermissionGate.tsx` – declarative `<PermissionGate require="x">`.

### P2 – UI Component Library
A consistent, touch-friendly primitive set lives in `shared/components/ui/`,
re-exported through a barrel for clean imports:

```tsx
import { Button, Input, Select, Modal, Badge, Spinner, EmptyState } from '@/shared/components/ui';
```

| Component | Purpose |
|-----------|---------|
| `Button` | Primary/secondary/ghost/danger variants, loading state, `tap-target`. |
| `Input` | Label + error + hint, RHF-compatible via `forwardRef`. |
| `Select` | Native select with custom chevron, label + error. |
| `Modal` | Bottom-sheet on mobile → centered dialog on `sm+`. |
| `Badge` | Status/category pill with 7 color variants. |
| `Spinner` / `FullScreenSpinner` | Loading indicators. |
| `EmptyState` / `ErrorState` | Friendly "no data" / retry states. |

### P2 – Per-Module Validation Schemas (Zod)
- ✅ `modules/transaction/transaction.schema.ts` – create + list-query schemas.

### P2 – Per-Module Custom Hooks
- ✅ `modules/transaction/useTransaction.ts` – `useTransactionList`,
  `useTransactionDetail`, `useApproveTransaction`.

### P3 – Mobile Shell
- ✅ `tap-target` utility (44×44 minimum touch target).
- ✅ `app-content`, `pt-safe`, `pb-safe` safe-area helpers.
- ✅ `no-scrollbar` for horizontal chip rows.

---

## 🚀 Getting Started

```bash
npm install
npm run dev      # start Vite dev server
npm run build    # production build
npm run lint     # ESLint
npx tsc --noEmit # type check
```

Set `VITE_API_URL` in `.env` to point at the backend.

---

## 📁 Structure

```
src/
├── app/                  # App shell, router, PermissionGate
├── modules/              # Feature modules (auth, dashboard, transaction, ...)
│   └── transaction/
│       ├── transaction.api.ts
│       ├── transaction.schema.ts   # Zod
│       ├── useTransaction.ts       # Hooks
│       ├── TransactionListPage.tsx
│       └── TransactionDetailPage.tsx
├── shared/
│   ├── api/              # apiClient
│   ├── components/
│   │   ├── ui/           # ← reusable primitives (barrel: index.ts)
│   │   ├── BottomNav.tsx
│   │   ├── PageHeader.tsx
│   │   ├── PullToRefresh.tsx
│   │   └── ...
│   ├── constants/        # permissions + labels
│   ├── hooks/            # useAuth, usePermission, useResource
│   ├── store/            # Zustand stores
│   └── types/            # shared TS types
├── index.css
└── main.tsx
```

---

## 🔐 Permission Usage

```tsx
import { PermissionGate } from '@/app/PermissionGate';
import { useHasPermission } from '@/shared/hooks/usePermission';

// Declarative
<PermissionGate require="transaction.approve">
  <Button onClick={approve}>Setujui</Button>
</PermissionGate>

// Imperative
const canApprove = useHasPermission('transaction.approve');