// ============================================
// FILE: backend/src/modules/reporting/report/report.service.ts
// Enhanced: Dynamic field selection, semua entity, filter tanggal
// ============================================

import { prisma } from '../../../shared/db/prisma';
import { BadRequestError } from '../../../shared/errors/AppError';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { isOwner } from '../../../shared/middleware/owner-only.middleware';

// ── Definisi field yang tersedia per entity ──────────────────
export const REPORT_ENTITY_FIELDS: Record<string, Array<{ key: string; label: string; type: string }>> = {
  customers: [
    { key: 'code',      label: 'Kode',           type: 'string' },
    { key: 'name',      label: 'Nama',            type: 'string' },
    { key: 'email',     label: 'Email',           type: 'string' },
    { key: 'phone',     label: 'Telepon',         type: 'string' },
    { key: 'address',   label: 'Alamat',          type: 'string' },
    { key: 'isActive',  label: 'Status',          type: 'boolean' },
    { key: 'createdAt', label: 'Tanggal Dibuat',  type: 'date' },
  ],
  vendors: [
    { key: 'code',      label: 'Kode',           type: 'string' },
    { key: 'name',      label: 'Nama',            type: 'string' },
    { key: 'email',     label: 'Email',           type: 'string' },
    { key: 'phone',     label: 'Telepon',         type: 'string' },
    { key: 'address',   label: 'Alamat',          type: 'string' },
    { key: 'isActive',  label: 'Status',          type: 'boolean' },
    { key: 'createdAt', label: 'Tanggal Dibuat',  type: 'date' },
  ],
  products: [
    { key: 'code',      label: 'Kode',            type: 'string' },
    { key: 'name',      label: 'Nama',            type: 'string' },
    { key: 'type',      label: 'Tipe',            type: 'string' },
    { key: 'category',  label: 'Kategori',        type: 'string' },
    { key: 'unit',      label: 'Satuan',          type: 'string' },
    { key: 'price',     label: 'Harga Jual',      type: 'number' },
    { key: 'cost',      label: 'Harga Beli',      type: 'number' },
    { key: 'isActive',  label: 'Status',          type: 'boolean' },
    { key: 'createdAt', label: 'Tanggal Dibuat',  type: 'date' },
  ],
  employees: [
    { key: 'code',       label: 'Kode',           type: 'string' },
    { key: 'name',       label: 'Nama',           type: 'string' },
    { key: 'email',      label: 'Email',          type: 'string' },
    { key: 'phone',      label: 'Telepon',        type: 'string' },
    { key: 'position',   label: 'Jabatan',        type: 'string' },
    { key: 'department', label: 'Departemen',     type: 'string' },
    { key: 'salary',     label: 'Gaji',           type: 'number' },
    { key: 'joinDate',   label: 'Tanggal Masuk',  type: 'date' },
    { key: 'status',     label: 'Status',         type: 'string' },
  ],
  transactions: [
    { key: 'code',        label: 'Kode',          type: 'string' },
    { key: 'type',        label: 'Tipe',          type: 'string' },
    { key: 'category',    label: 'Kategori',      type: 'string' },
    { key: 'amount',      label: 'Jumlah',        type: 'number' },
    { key: 'date',        label: 'Tanggal',       type: 'date' },
    { key: 'status',      label: 'Status',        type: 'string' },
    { key: 'description', label: 'Keterangan',    type: 'string' },
  ],
  leases: [
    { key: 'unitName',   label: 'Unit',            type: 'string' },
    { key: 'amount',     label: 'Nilai Sewa',      type: 'number' },
    { key: 'startDate',  label: 'Tanggal Mulai',   type: 'date' },
    { key: 'endDate',    label: 'Tanggal Selesai', type: 'date' },
    { key: 'status',     label: 'Status',          type: 'string' },
    { key: 'notes',      label: 'Catatan',         type: 'string' },
  ],
  purchases: [
    { key: 'code',      label: 'Nomor PO',      type: 'string' },
    { key: 'date',      label: 'Tanggal',       type: 'date' },
    { key: 'total',     label: 'Total',         type: 'number' },
    { key: 'status',    label: 'Status',        type: 'string' },
    { key: 'notes',     label: 'Catatan',       type: 'string' },
  ],
  productions: [
    { key: 'code',      label: 'Kode',          type: 'string' },
    { key: 'batchNo',   label: 'Batch',         type: 'string' },
    { key: 'date',      label: 'Tanggal',       type: 'date' },
    { key: 'status',    label: 'Status',        type: 'string' },
    { key: 'notes',     label: 'Catatan',       type: 'string' },
  ],
  warehouses: [
    { key: 'code',      label: 'Kode',          type: 'string' },
    { key: 'name',      label: 'Nama',          type: 'string' },
    { key: 'address',   label: 'Alamat',        type: 'string' },
    { key: 'isActive',  label: 'Status',        type: 'boolean' },
    { key: 'createdAt', label: 'Tanggal Dibuat', type: 'date' },
  ],
  assets: [
    { key: 'code',        label: 'Kode',            type: 'string' },
    { key: 'name',        label: 'Nama',            type: 'string' },
    { key: 'type',        label: 'Tipe',            type: 'string' },
    { key: 'condition',   label: 'Kondisi',         type: 'string' },
    { key: 'purchaseDate',label: 'Tanggal Beli',    type: 'date' },
    { key: 'isActive',    label: 'Status',          type: 'boolean' },
  ],
};

export const REPORT_ENTITY_LABELS: Record<string, string> = {
  customers:    'Customer',
  vendors:      'Vendor',
  products:     'Produk',
  employees:    'Karyawan',
  transactions: 'Transaksi',
  leases:       'Sewa',
  purchases:    'Pembelian',
  productions:  'Produksi',
  warehouses:   'Gudang',
  assets:       'Aset',
};

export interface CustomReportOptions {
  entity:     string;
  fields:     string[];          // field keys yang dipilih user
  startDate?: Date;
  endDate?:   Date;
  status?:    string;
}

export class ReportService {
  // ── Permission-scoped Dashboard Stats ────────────────────────
  //
  // 🔐 ROLE-BASED ACCESS CONTROL (Principle of Least Privilege)
  //
  // Dashboard data is filtered according to the user's actual permissions.
  // Sensitive financial/revenue data is NEVER returned to roles without the
  // corresponding transaction/finance permission. Only Owner sees the full
  // picture (handled by the separate Owner-only endpoint).
  //
  // Returns a `scope` map so the frontend can render widgets conditionally
  // and a `sections` object containing only the data the user may see.
  async getDashboardStats(companyId: string, userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // ── Resolve the user's permission set in a single query ────
    const permRows = await prisma.rolePermission.findMany({
      where: {
        role: {
          companyUsers: { some: { userId, companyId, isActive: true } },
        },
      },
      select: { permission: { select: { code: true } } },
    });
    const perms = new Set(permRows.map((r) => r.permission.code));
    const has = (code: string) => perms.has(code);

    // 🔒 Financial data is strictly Owner-only. Even if a role holds the
    // TRANSACTION_VIEW permission, revenue/expense figures are never exposed
    // on the standard dashboard — Owners use the dedicated Owner Dashboard.
    const ownerOnly = await isOwner(userId, companyId);

    // Determine what sections the user is authorized to view.
    const scope = {
      customers:    has(PERMISSIONS.CUSTOMER_VIEW),
      vendors:      has(PERMISSIONS.VENDOR_VIEW),
      products:     has(PERMISSIONS.PRODUCT_VIEW),
      employees:    has(PERMISSIONS.EMPLOYEE_VIEW),
      assets:       has(PERMISSIONS.ASSET_VIEW),
      locations:    has(PERMISSIONS.LOCATION_VIEW),
      leases:       has(PERMISSIONS.LEASE_VIEW),
      warehouses:   has(PERMISSIONS.WAREHOUSE_VIEW),
      stock:        has(PERMISSIONS.STOCK_VIEW),
      production:   has(PERMISSIONS.PRODUCTION_VIEW),
      // 🔒 Financial data — STRICTLY Owner-only.
      transactions: ownerOnly && has(PERMISSIONS.TRANSACTION_VIEW),
      purchases:    has(PERMISSIONS.PURCHASE_VIEW),
    };

    // ── Build only the queries the user is authorized to run ───
    const queries: Promise<unknown>[] = [];
    const q = {
      customers:    () => prisma.customer.count({ where: { companyId, isActive: true, deletedAt: null } }),
      vendors:      () => prisma.vendor.count({ where: { companyId, isActive: true, deletedAt: null } }),
      products:     () => prisma.product.count({ where: { companyId, isActive: true, deletedAt: null } }),
      employees:    () => prisma.employee.count({ where: { companyId, status: 'active', deletedAt: null } }),
      assets:       () => prisma.asset.count({ where: { companyId, isActive: true, deletedAt: null } }),
      leases:       () => prisma.lease.count({ where: { companyId, status: 'active', deletedAt: null, endDate: { gte: today } } }),
      warehouses:   () => prisma.warehouse.count({ where: { companyId, isActive: true, deletedAt: null } }),
      stock:        () => prisma.stock.count({ where: { warehouse: { companyId, deletedAt: null } } }),
      production:   () => prisma.production.count({ where: { companyId, deletedAt: null, date: { gte: monthStart } } }),
      txCount:      () => prisma.transaction.count({ where: { companyId, deletedAt: null, createdAt: { gte: today } } }),
      txRevenue:    () => prisma.transaction.aggregate({ where: { companyId, deletedAt: null, type: 'income', date: { gte: monthStart } }, _sum: { amount: true } }),
      txExpense:    () => prisma.transaction.aggregate({ where: { companyId, deletedAt: null, type: 'expense', date: { gte: monthStart } }, _sum: { amount: true } }),
      purchases:    () => prisma.purchase.count({ where: { companyId, deletedAt: null, date: { gte: monthStart } } }),
    } as const;

    type Key = keyof typeof q;
    const pending: Key[] = [];
    if (scope.customers)    { pending.push('customers'); queries.push(q.customers()); }
    if (scope.vendors)      { pending.push('vendors');   queries.push(q.vendors()); }
    if (scope.products)     { pending.push('products');  queries.push(q.products()); }
    if (scope.employees)    { pending.push('employees'); queries.push(q.employees()); }
    if (scope.assets)       { pending.push('assets');    queries.push(q.assets()); }
    if (scope.leases)       { pending.push('leases');    queries.push(q.leases()); }
    if (scope.warehouses)   { pending.push('warehouses');queries.push(q.warehouses()); }
    if (scope.stock)        { pending.push('stock');     queries.push(q.stock()); }
    if (scope.production)   { pending.push('production');queries.push(q.production()); }
    if (scope.transactions) {
      pending.push('txCount', 'txRevenue', 'txExpense');
      queries.push(q.txCount(), q.txRevenue(), q.txExpense());
    }
    if (scope.purchases)    { pending.push('purchases'); queries.push(q.purchases()); }

    const results = await Promise.all(queries);
    const byKey: Record<string, number | { _sum: { amount: number | null } }> = {};
    pending.forEach((k, i) => { byKey[k] = results[i] as number | { _sum: { amount: number | null } }; });

    const num = (k: Key): number => (typeof byKey[k] === 'number' ? (byKey[k] as number) : 0);
    const sum = (k: 'txRevenue' | 'txExpense'): number =>
      byKey[k] && typeof byKey[k] === 'object' ? ((byKey[k] as { _sum: { amount: number | null } })._sum.amount ?? 0) : 0;

    // ── Assemble response — only include sections in scope ─────
    const summary: Record<string, number> = {};
    if (scope.customers)  summary.customers  = num('customers');
    if (scope.vendors)    summary.vendors    = num('vendors');
    if (scope.products)   summary.products   = num('products');
    if (scope.employees)  summary.employees  = num('employees');
    if (scope.assets)     summary.assets     = num('assets');

    const operations: Record<string, number> = {};
    if (scope.leases)       operations.activeLeases       = num('leases');
    if (scope.warehouses)   operations.warehouses         = num('warehouses');
    if (scope.stock)        operations.stockItems         = num('stock');
    if (scope.production)   operations.monthlyProductions = num('production');
    if (scope.purchases)    operations.monthlyPurchases   = num('purchases');

    // 🔒 Financial block — only for roles with transaction permission.
    const financial = scope.transactions
      ? {
          todayTransactions: num('txCount'),
          monthlyRevenue:    sum('txRevenue'),
          monthlyExpense:    sum('txExpense'),
          netCashflow:       sum('txRevenue') - sum('txExpense'),
        }
      : undefined;

    return {
      scope,
      summary,
      operations,
      ...(financial ? { financial } : {}),
      timestamp: new Date(),
    };
  }

  // ── Get available fields untuk entity ─────────────────────
  getEntityFields(entity: string) {
    const fields = REPORT_ENTITY_FIELDS[entity];
    if (!fields) throw new BadRequestError(`Entity tidak dikenal: ${entity}`);
    return fields;
  }

  // ── Generate Custom Report ──────────────────────────────────
  async generateCustomReport(companyId: string, options: CustomReportOptions) {
    const { entity, fields, startDate, endDate, status } = options;

    if (!REPORT_ENTITY_FIELDS[entity]) {
      throw new BadRequestError(`Entity tidak dikenal: ${entity}`);
    }

    if (!fields || fields.length === 0) {
      throw new BadRequestError('Pilih minimal 1 field untuk ditampilkan');
    }

    const raw = await this.fetchEntityData(companyId, entity, { startDate, endDate, status });

    // Filter hanya field yang dipilih
    const data = raw.map((row: any) => {
      const filtered: Record<string, any> = {};
      fields.forEach((f) => {
        if (f in row) filtered[f] = row[f];
      });
      return filtered;
    });

    const availableFields = REPORT_ENTITY_FIELDS[entity];
    const selectedFields = availableFields.filter((f) => fields.includes(f.key));

    return {
      entity,
      entityLabel:    REPORT_ENTITY_LABELS[entity] ?? entity,
      selectedFields,
      totalRows:      data.length,
      data,
      generatedAt:    new Date(),
      filters: { startDate, endDate, status },
    };
  }

  // ── Fetch raw data per entity ───────────────────────────────
  private async fetchEntityData(
    companyId: string,
    entity: string,
    filters: { startDate?: Date; endDate?: Date; status?: string }
  ) {
    const { startDate, endDate, status } = filters;
    const dateFilter = (field: string) =>
      startDate || endDate
        ? { [field]: { ...(startDate && { gte: startDate }), ...(endDate && { lte: endDate }) } }
        : {};
    const statusFilter = status ? { status } : {};

    switch (entity) {
      case 'customers':
        return prisma.customer.findMany({
          where: { companyId, deletedAt: null, ...statusFilter, ...dateFilter('createdAt') },
          orderBy: { createdAt: 'desc' },
        });

      case 'vendors':
        return prisma.vendor.findMany({
          where: { companyId, deletedAt: null, ...statusFilter, ...dateFilter('createdAt') },
          orderBy: { createdAt: 'desc' },
        });

      case 'products':
        return prisma.product.findMany({
          where: { companyId, deletedAt: null, ...dateFilter('createdAt') },
          orderBy: { name: 'asc' },
        });

      case 'employees':
        return prisma.employee.findMany({
          where: { companyId, deletedAt: null, ...statusFilter, ...dateFilter('joinDate') },
          orderBy: { name: 'asc' },
        });

      case 'transactions':
        return prisma.transaction.findMany({
          where: { companyId, deletedAt: null, ...statusFilter, ...dateFilter('date') },
          orderBy: { date: 'desc' },
        });

      case 'leases':
        return prisma.lease.findMany({
          where: { companyId, deletedAt: null, ...statusFilter, ...dateFilter('startDate') },
          include: { customer: { select: { name: true, code: true } } },
          orderBy: { startDate: 'desc' },
        });

      case 'purchases':
        return prisma.purchase.findMany({
          where: { companyId, deletedAt: null, ...statusFilter, ...dateFilter('date') },
          include: { vendor: { select: { name: true, code: true } } },
          orderBy: { date: 'desc' },
        });

      case 'productions':
        return prisma.production.findMany({
          where: { companyId, deletedAt: null, ...statusFilter, ...dateFilter('date') },
          orderBy: { date: 'desc' },
        });

      case 'warehouses':
        return prisma.warehouse.findMany({
          where: { companyId, deletedAt: null, ...dateFilter('createdAt') },
          orderBy: { name: 'asc' },
        });

      case 'assets':
        return prisma.asset.findMany({
          where: { companyId, deletedAt: null, ...dateFilter('purchaseDate') },
          orderBy: { name: 'asc' },
        });

      default:
        throw new BadRequestError(`Entity tidak dikenal: ${entity}`);
    }
  }

  // ── Legacy generate (tetap untuk kompatibilitas) ────────────
  async generate(companyId: string, options: { type: string; startDate?: Date; endDate?: Date }) {
    const entityMap: Record<string, string> = {
      leases: 'leases', stocks: 'warehouses', transactions: 'transactions',
      production: 'productions', employees: 'employees',
    };

    const entity = entityMap[options.type];
    if (!entity) throw new BadRequestError('Invalid report type');

    const fields = REPORT_ENTITY_FIELDS[entity].map((f) => f.key);
    return this.generateCustomReport(companyId, { entity, fields, ...options });
  }
}