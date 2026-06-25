# Nexora ERP

A multi-tenant Enterprise Resource Planning (ERP) platform with modular domain architecture (customers, vendors, products, employees, inventory, leases, assets, production, reporting, RBAC).

Built with a clear separation between a TypeScript/Express + Prisma backend and a React + Vite + TypeScript frontend.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, TypeScript 5, TailwindCSS, React Router, Zustand, React Hook Form, Zod, Axios |
| Backend | Node.js, Express 4, TypeScript 5, Prisma ORM (MySQL), Zod validation |
| Security | JWT auth, bcrypt password hashing, Helmet headers, rate limiting, per-request tenant scoping |

---

## Prerequisites

- **Node.js** ≥ 18
- **MySQL** ≥ 8
- **npm** ≥ 9

---

## Quick Start

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend (from project root)
cd ../frontend
npm install
```

### 2. Configure environment

**Backend** — copy and fill in real values:

```bash
cp backend/.env.example backend/.env
```

Required variables (see `backend/.env.example`):

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (default `3000`) |
| `NODE_ENV` | `development` \| `production` |
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | ≥ 32 chars in production. Generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `CORS_ORIGIN` | Frontend origin URL |
| `LOG_LEVEL` | `debug` \| `info` \| `warn` \| `error` |

**Frontend** — copy and configure:

```bash
cp frontend/.env.example frontend/.env
```

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL (default `http://localhost:3000/api/v1`) |

### 3. Database setup

From the `backend/` directory:

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed reference data (modules, permissions)
npm run prisma:seed
```

### 4. Run the application

```bash
# Terminal 1 — backend (from backend/)
npm run dev

# Terminal 2 — frontend (from frontend/)
npm run dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173
- Health check: http://localhost:3000/health

---

## Project Structure

```
Nexora-Erp/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.ts              # Reference data seeding
│   └── src/
│       ├── config/              # Environment configuration
│       ├── modules/             # Feature modules (domain-driven)
│       │   ├── core/            # auth, user, role, audit, code
│       │   ├── data/            # customer, vendor, product, employee, asset
│       │   ├── operations/      # transaction, stock, lease, production, warehouse, purchase
│       │   └── reporting/       # reports & dashboard
│       ├── routes/              # Express route registration
│       └── shared/              # Cross-cutting concerns
│           ├── db/              # Prisma client
│           ├── errors/          # AppError hierarchy
│           ├── middleware/      # auth, tenant, permission, validation, audit
│           ├── types/           # Express type augmentations
│           └── utils/           # hash, jwt, response, validation
└── frontend/
    └── src/
        ├── app/                 # App shell, routing, providers
        ├── modules/             # Feature modules mirroring backend domains
        └── shared/              # api clients, components, hooks, store, types
```

Each backend module follows a consistent layered structure:

```
module/
├── *.routes.ts        # Express router + middleware composition
├── *.controller.ts    # HTTP request/response handling
├── *.service.ts       # Business logic
├── *.repository.ts    # Data access (Prisma)
├── *.validation.ts    # Zod input schemas
└── *.types.ts         # TypeScript types & DTOs
```

---

## Available Scripts

### Backend (`cd backend`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm run prisma:seed` | Seed reference data |

### Frontend (`cd frontend`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

---

## Architecture

### Multi-Tenancy

The system is multi-tenant by design. Every data-scoped request flows through:

1. **`authenticate`** — verifies the JWT and loads `req.user`.
2. **`requireCompany`** — resolves `X-Company-Id` header, verifies the user has active access to that company, and sets `req.activeCompanyId`.
3. **`requirePermission(...)`** — (where applicable) verifies the user's role grants the required permission within the active company.

All repositories scope queries by `companyId`, preventing cross-tenant data access.

### Authentication & Authorization

- Passwords are hashed with bcrypt before storage.
- JWTs carry `userId` and `email`; the user record is re-verified on every request.
- Role-Based Access Control: roles are per-company; permissions are assigned to roles and checked per endpoint.
- Sensitive fields (`password`, `token`, `authorization`) are redacted from logs and error output.

### Error Handling

A global error handler normalizes:
- **ZodError** → `422` with field-keyed validation messages
- **AppError** → custom status code + message
- **Prisma errors** → mapped HTTP status (unique constraint, not found, FK violation)
- **Unknown errors** → `500` with a generic message in production (stack traces only in development)

---

## Security

- `helmet` sets secure HTTP headers.
- `express-rate-limit` throttles API requests (100 req / 15 min / IP).
- CORS is locked to `CORS_ORIGIN`.
- JWT secret must be ≥ 32 characters in production (enforced at startup).
- `.env` files are git-ignored and must never be committed.

---

## License

Proprietary. All rights reserved.