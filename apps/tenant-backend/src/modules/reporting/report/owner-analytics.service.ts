// ============================================
// FILE: backend/src/modules/reporting/report/owner-analytics.service.ts
// Comprehensive Owner-only platform analytics computed from real data.
// ============================================

import { prisma } from '../../../shared/db/prisma';

export interface TrendPoint {
  period: string;
  label: string;
  value: number;
}

export interface ChangeMetric {
  current: number;
  previous: number;
  change: number;
  changePct: number;
}

export interface OwnerDashboardStats {
  generatedAt: string;
  periodRange: { from: string; to: string };
  users: {
    total: number; active: number; inactive: number;
    newToday: number; newThisWeek: number; newThisMonth: number;
    verifiedRate: number; trend: TrendPoint[];
    byRole: { role: string; count: number }[];
    byStatus: { status: string; count: number }[];
    retentionRate: number;
    dau: number; wau: number; mau: number;
    newVsReturning: { label: string; value: number }[];
  };
  masterData: {
    customers: ChangeMetric; vendors: ChangeMetric; products: ChangeMetric;
    employees: ChangeMetric; assets: ChangeMetric; locations: ChangeMetric;
    totalRecords: number;
  };
  financial: {
    incomeThisMonth: number; expenseThisMonth: number; netThisMonth: number;
    incomeLastMonth: number; expenseLastMonth: number; netLastMonth: number;
    incomeChangePct: number; expenseChangePct: number; netChangePct: number;
    totalTransactions: number; pendingApprovals: number; approvedTransactions: number;
    monthlyTrend: TrendPoint[];
    byCategory: { category: string; income: number; expense: number }[];
    avgTransactionValue: number;
    expenseRatio: number;
    ytdIncome: number; ytdExpense: number; ytdNet: number;
  };
  operations: {
    activeLeases: number; expiringLeases: number; totalLeaseValue: number;
    openPurchases: number; completedProductions: number; pendingProductions: number;
    stockMovementsThisMonth: number; warehouses: number;
    productionTrend: TrendPoint[]; transactionTrend: TrendPoint[];
    avgLeaseValue: number;
    productionCompletionRate: number;
  };
  systemActivity: {
    totalAuditLogs: number; logsToday: number; logsThisWeek: number;
    uniqueActiveUsersThisWeek: number;
    byAction: { action: string; count: number }[];
    byModule: { module: string; count: number }[];
    activityTrend: TrendPoint[];
    peakHour: number;
    actionSuccessRate: number;
  };
  notifications: {
    total: number; unread: number; readRate: number;
    byType: { type: string; count: number }[];
    sentToday: number;
  };
  databaseGrowth: { tables: { name: string; rows: number }[]; totalRows: number };
  approvals: { pending: number; approved: number; rejected: number; approvalRate: number };
  topEntities: {
    topCustomersByLease: { name: string; code: string | null; leases: number; value: number }[];
    topProductsByStockValue: { name: string; code: string | null; quantity: number; value: number }[];
    topUsersByActivity: { name: string; actions: number }[];
    recentActivity: { id: string; userName: string; module: string; action: string; entityType: string; createdAt: string }[];
    topVendorsByPurchase: { name: string; code: string | null; purchases: number; value: number }[];
  };
  health: {
    companiesCount: number; activeCompanies: number; rolesCount: number;
    permissionsConfigured: number; modulesEnabled: number;
    avgPermissionsPerRole: number;
  };
  insights: {
    severity: 'info' | 'warning' | 'success' | 'danger';
    icon: string;
    title: string;
    detail: string;
  }[];
}

// ── Date helpers ────────────────────────────────────────────
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function monthsAgo(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() - n, 1);
}

function daysAgo(d: Date, n: number): Date {
  const x = startOfDay(d);
  x.setDate(x.getDate() - n);
  return x;
}

function pctChange(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function makeChangeMetric(current: number, previous: number): ChangeMetric {
  return {
    current,
    previous,
    change: current - previous,
    changePct: pctChange(current, previous),
  };
}

// ── Service ─────────────────────────────────────────────────
export class OwnerAnalyticsService {
  async getOwnerDashboard(companyId: string): Promise<OwnerDashboardStats> {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now);

    // Run all major sections concurrently for optimal performance.
    const [users, masterData, financial, operations, systemActivity, notifications, databaseGrowth, approvals, topEntities, health] =
      await Promise.all([
        this.getUsersMetrics(companyId, now),
        this.getMasterDataMetrics(companyId, lastMonthEnd),
        this.getFinancialMetrics(companyId, monthStart, lastMonthStart, lastMonthEnd, now),
        this.getOperationsMetrics(companyId, now, monthStart),
        this.getSystemActivityMetrics(companyId, todayStart, weekStart, now),
        this.getNotificationsMetrics(companyId, todayStart),
        this.getDatabaseGrowthMetrics(companyId),
        this.getApprovalsMetrics(companyId),
        this.getTopEntitiesMetrics(companyId, weekStart),
        this.getHealthMetrics(companyId),
      ]);

    // Build actionable insights from the computed data.
    const insights = this.buildInsights({ users, financial, operations, systemActivity, approvals });

    return {
      generatedAt: now.toISOString(),
      periodRange: { from: monthStart.toISOString(), to: now.toISOString() },
      users,
      masterData,
      financial,
      operations,
      systemActivity,
      notifications,
      databaseGrowth,
      approvals,
      topEntities,
      health,
      insights,
    };
  }

  private bucketMonthly(dates: Date[], now: Date, months: number): TrendPoint[] {
    const buckets = new Map<string, number>();
    for (let i = months - 1; i >= 0; i--) {
      const d = monthsAgo(now, i);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets.set(k, 0);
    }
    for (const dt of dates) {
      const k = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      if (buckets.has(k)) buckets.set(k, (buckets.get(k) || 0) + 1);
    }
    return Array.from(buckets.entries()).map(([k, v]) => ({
      period: k,
      label: MONTH_LABELS[Number(k.split('-')[1]) - 1],
      value: v,
    }));
  }

  private async getUsersMetrics(companyId: string, now: Date): Promise<OwnerDashboardStats['users']> {
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    const [
      total,
      active,
      inactive,
      newToday,
      newThisWeek,
      newThisMonth,
      trendRaw,
      byRoleRaw,
      byStatus,
      dauUsers,
      wauUsers,
      mauUsers,
    ] = await Promise.all([
      prisma.companyUser.count({ where: { companyId } }),
      prisma.companyUser.count({ where: { companyId, isActive: true, user: { isActive: true } } }),
      prisma.companyUser.count({ where: { companyId, user: { isActive: false } } }),
      prisma.companyUser.count({ where: { companyId, createdAt: { gte: todayStart } } }),
      prisma.companyUser.count({ where: { companyId, createdAt: { gte: weekStart } } }),
      prisma.companyUser.count({ where: { companyId, createdAt: { gte: monthStart } } }),
      prisma.companyUser.findMany({
        where: { companyId, createdAt: { gte: monthsAgo(now, 11) } },
        select: { createdAt: true },
      }),
      prisma.companyUser.groupBy({
        by: ['roleId'],
        where: { companyId, isActive: true },
        _count: { roleId: true },
      }),
      prisma.user.groupBy({
        by: ['isActive'],
        where: { companyUsers: { some: { companyId } } },
        _count: { isActive: true },
      }),
      prisma.auditLog
        .findMany({ where: { companyId, createdAt: { gte: todayStart } }, distinct: ['userId'], select: { userId: true } })
        .then((r) => r.length),
      prisma.auditLog
        .findMany({ where: { companyId, createdAt: { gte: weekStart } }, distinct: ['userId'], select: { userId: true } })
        .then((r) => r.length),
      prisma.auditLog
        .findMany({ where: { companyId, createdAt: { gte: monthStart } }, distinct: ['userId'], select: { userId: true } })
        .then((r) => r.length),
    ]);

    const roleIds = byRoleRaw.map((r) => r.roleId);
    const roles = roleIds.length
      ? await prisma.role.findMany({ where: { id: { in: roleIds } }, select: { id: true, name: true } })
      : [];
    const roleMap = new Map(roles.map((r) => [r.id, r.name]));
    const retentionRate = total > 0 ? Number(((active / total) * 100).toFixed(1)) : 0;

    return {
      total,
      active,
      inactive,
      newToday,
      newThisWeek,
      newThisMonth,
      verifiedRate: retentionRate,
      trend: this.bucketMonthly(trendRaw.map((r) => r.createdAt), now, 12),
      byRole: byRoleRaw
        .map((r) => ({ role: roleMap.get(r.roleId) ?? 'Unknown', count: r._count.roleId }))
        .sort((a, b) => b.count - a.count),
      byStatus: byStatus.map((r) => ({
        status: r.isActive ? 'Aktif' : 'Nonaktif',
        count: r._count.isActive,
      })),
      retentionRate,
      dau: dauUsers,
      wau: wauUsers,
      mau: mauUsers,
      newVsReturning: [
        { label: 'Pengguna Baru', value: newThisMonth },
        { label: 'Pengguna Eksisting', value: Math.max(active - newThisMonth, 0) },
      ],
    };
  }

  private async getMasterDataMetrics(companyId: string, lastMonthEnd: Date) {
    const af = { companyId, deletedAt: null, isActive: true };
    const [cN, cP, vN, vP, pN, pP, eN, eP, aN, aP, lN, lP] = await Promise.all([
      prisma.customer.count({ where: { ...af } }),
      prisma.customer.count({ where: { companyId, deletedAt: null, createdAt: { lte: lastMonthEnd } } }),
      prisma.vendor.count({ where: { ...af } }),
      prisma.vendor.count({ where: { companyId, deletedAt: null, createdAt: { lte: lastMonthEnd } } }),
      prisma.product.count({ where: { ...af } }),
      prisma.product.count({ where: { companyId, deletedAt: null, createdAt: { lte: lastMonthEnd } } }),
      prisma.employee.count({ where: { companyId, deletedAt: null, status: 'active' } }),
      prisma.employee.count({ where: { companyId, deletedAt: null, createdAt: { lte: lastMonthEnd } } }),
      prisma.asset.count({ where: { ...af } }),
      prisma.asset.count({ where: { companyId, deletedAt: null, createdAt: { lte: lastMonthEnd } } }),
      prisma.location.count({ where: { ...af } }),
      prisma.location.count({ where: { companyId, deletedAt: null, createdAt: { lte: lastMonthEnd } } }),
    ]);

    return {
      customers: makeChangeMetric(cN, cP),
      vendors: makeChangeMetric(vN, vP),
      products: makeChangeMetric(pN, pP),
      employees: makeChangeMetric(eN, eP),
      assets: makeChangeMetric(aN, aP),
      locations: makeChangeMetric(lN, lP),
      totalRecords: cN + vN + pN + eN + aN + lN,
    };
  }

  private async getFinancialMetrics(
    companyId: string,
    monthStart: Date,
    lastMonthStart: Date,
    lastMonthEnd: Date,
    now: Date
  ): Promise<OwnerDashboardStats['financial']> {
    const base = { companyId, deletedAt: null, status: 'approved' as const };
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [
      iM,
      eM,
      iL,
      eL,
      totalTx,
      pending,
      approved,
      netRaw,
      catRaw,
      ytdIncomeAgg,
      ytdExpenseAgg,
    ] = await Promise.all([
      prisma.transaction.aggregate({ where: { ...base, type: 'income', date: { gte: monthStart } }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { ...base, type: 'expense', date: { gte: monthStart } }, _sum: { amount: true } }),
      prisma.transaction.aggregate({
        where: { ...base, type: 'income', date: { gte: lastMonthStart, lte: lastMonthEnd } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...base, type: 'expense', date: { gte: lastMonthStart, lte: lastMonthEnd } },
        _sum: { amount: true },
      }),
      prisma.transaction.count({ where: { companyId, deletedAt: null } }),
      prisma.transaction.count({ where: { companyId, deletedAt: null, status: 'draft' } }),
      prisma.transaction.count({ where: { companyId, deletedAt: null, status: 'approved' } }),
      prisma.transaction.findMany({
        where: { ...base, date: { gte: monthsAgo(now, 5) } },
        select: { type: true, amount: true, date: true },
      }),
      prisma.transaction.findMany({
        where: { ...base, date: { gte: monthStart } },
        select: { category: true, type: true, amount: true },
      }),
      prisma.transaction.aggregate({ where: { ...base, type: 'income', date: { gte: yearStart } }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { ...base, type: 'expense', date: { gte: yearStart } }, _sum: { amount: true } }),
    ]);

    const iMv = Number(iM._sum.amount || 0);
    const eMv = Number(eM._sum.amount || 0);
    const iLv = Number(iL._sum.amount || 0);
    const eLv = Number(eL._sum.amount || 0);
    const nMv = iMv - eMv;
    const nLv = iLv - eLv;
    const ytdIncome = Number(ytdIncomeAgg._sum.amount || 0);
    const ytdExpense = Number(ytdExpenseAgg._sum.amount || 0);

    // 6-month net trend buckets
    const buckets = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const d = monthsAgo(now, i);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets.set(k, 0);
    }
    for (const r of netRaw) {
      const k = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, '0')}`;
      if (buckets.has(k)) buckets.set(k, (buckets.get(k) || 0) + (r.type === 'income' ? Number(r.amount) : -Number(r.amount)));
    }
    const monthlyTrend: TrendPoint[] = Array.from(buckets.entries()).map(([k, v]) => ({
      period: k,
      label: MONTH_LABELS[Number(k.split('-')[1]) - 1],
      value: v,
    }));

    // Category breakdown
    const catMap = new Map<string, { income: number; expense: number }>();
    for (const r of catRaw) {
      const c = (r.category || 'Lainnya').trim() || 'Lainnya';
      if (!catMap.has(c)) catMap.set(c, { income: 0, expense: 0 });
      const entry = catMap.get(c)!;
      if (r.type === 'income') entry.income += Number(r.amount);
      else entry.expense += Number(r.amount);
    }
    const byCategory = Array.from(catMap.entries())
      .map(([category, v]) => ({ category, income: v.income, expense: v.expense }))
      .sort((a, b) => b.income + b.expense - (a.income + a.expense))
      .slice(0, 8);

    return {
      incomeThisMonth: iMv,
      expenseThisMonth: eMv,
      netThisMonth: nMv,
      incomeLastMonth: iLv,
      expenseLastMonth: eLv,
      netLastMonth: nLv,
      incomeChangePct: pctChange(iMv, iLv),
      expenseChangePct: pctChange(eMv, eLv),
      netChangePct: pctChange(nMv, nLv),
      totalTransactions: totalTx,
      pendingApprovals: pending,
      approvedTransactions: approved,
      monthlyTrend,
      byCategory,
      avgTransactionValue: approved > 0 ? Number(((iMv + eMv) / approved).toFixed(0)) : 0,
      expenseRatio: iMv > 0 ? Number(((eMv / iMv) * 100).toFixed(1)) : 0,
      ytdIncome,
      ytdExpense,
      ytdNet: ytdIncome - ytdExpense,
    };
  }

  private async getOperationsMetrics(
    companyId: string,
    now: Date,
    monthStart: Date
  ): Promise<OwnerDashboardStats['operations']> {
    const in30 = new Date(now.getTime() + 30 * 86400000);

    const [
      activeLeases,
      expiringLeases,
      leaseSum,
      openPurchases,
      completedProd,
      pendingProd,
      stockMoves,
      warehouses,
      prodRaw,
      trxRaw,
    ] = await Promise.all([
      prisma.lease.count({ where: { companyId, deletedAt: null, status: 'active', endDate: { gte: now } } }),
      prisma.lease.count({ where: { companyId, deletedAt: null, status: 'active', endDate: { gte: now, lte: in30 } } }),
      prisma.lease.aggregate({ where: { companyId, deletedAt: null, status: 'active', endDate: { gte: now } }, _sum: { amount: true } }),
      prisma.purchase.count({ where: { companyId, deletedAt: null, status: { in: ['draft', 'approved'] } } }),
      prisma.production.count({ where: { companyId, deletedAt: null, status: 'completed' } }),
      prisma.production.count({ where: { companyId, deletedAt: null, status: { in: ['draft', 'in_progress'] } } }),
      prisma.stockMovement.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.warehouse.count({ where: { companyId, deletedAt: null, isActive: true } }),
      prisma.production.findMany({ where: { companyId, deletedAt: null, date: { gte: monthsAgo(now, 5) } }, select: { date: true } }),
      prisma.transaction.findMany({ where: { companyId, deletedAt: null, date: { gte: monthsAgo(now, 5) } }, select: { date: true } }),
    ]);

    const totalLeaseValue = Number(leaseSum._sum.amount || 0);
    const totalProd = completedProd + pendingProd;

    return {
      activeLeases,
      expiringLeases,
      totalLeaseValue,
      openPurchases,
      completedProductions: completedProd,
      pendingProductions: pendingProd,
      stockMovementsThisMonth: stockMoves,
      warehouses,
      productionTrend: this.bucketMonthly(prodRaw.map((r) => r.date), now, 6),
      transactionTrend: this.bucketMonthly(trxRaw.map((r) => r.date), now, 6),
      avgLeaseValue: activeLeases > 0 ? Number((totalLeaseValue / activeLeases).toFixed(0)) : 0,
      productionCompletionRate: totalProd > 0 ? Number(((completedProd / totalProd) * 100).toFixed(1)) : 0,
    };
  }

  private async getSystemActivityMetrics(
    companyId: string,
    todayStart: Date,
    weekStart: Date,
    now: Date
  ): Promise<OwnerDashboardStats['systemActivity']> {
    const [totalLogs, logsToday, logsThisWeek, uniqueUsers, byAction, byModule, trendRaw] = await Promise.all([
      prisma.auditLog.count({ where: { companyId } }),
      prisma.auditLog.count({ where: { companyId, createdAt: { gte: todayStart } } }),
      prisma.auditLog.count({ where: { companyId, createdAt: { gte: weekStart } } }),
      prisma.auditLog
        .findMany({ where: { companyId, createdAt: { gte: weekStart } }, distinct: ['userId'], select: { userId: true } })
        .then((r) => r.length),
      prisma.auditLog
        .groupBy({ by: ['action'], where: { companyId }, _count: { action: true } })
        .then((r) => r.map((x) => ({ action: x.action, count: x._count.action })).sort((a, b) => b.count - a.count)),
      prisma.auditLog
        .groupBy({ by: ['module'], where: { companyId }, _count: { module: true } })
        .then((r) => r.map((x) => ({ module: x.module, count: x._count.module })).sort((a, b) => b.count - a.count)),
      prisma.auditLog.findMany({
        where: { companyId, createdAt: { gte: daysAgo(now, 13) } },
        select: { createdAt: true },
      }),
    ]);

    // 14-day activity trend
    const labels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const buckets = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = daysAgo(now, i);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      buckets.set(k, 0);
    }
    for (const r of trendRaw) {
      const d = r.createdAt;
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (buckets.has(k)) buckets.set(k, (buckets.get(k) || 0) + 1);
    }
    const activityTrend: TrendPoint[] = Array.from(buckets.entries()).map(([k, v]) => {
      const parts = k.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return { period: k, label: `${labels[d.getDay()]} ${d.getDate()}`, value: v };
    });

    // Peak hour from today's logs
    const todayLogs = await prisma.auditLog.findMany({
      where: { companyId, createdAt: { gte: todayStart } },
      select: { createdAt: true },
    });
    const hourCounts = new Array(24).fill(0);
    for (const log of todayLogs) hourCounts[log.createdAt.getHours()]++;
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

    // Action success rate (non-error actions / total)
    const errorActions = byAction.filter((a) => /error|fail|delete/i.test(a.action)).reduce((s, a) => s + a.count, 0);
    const actionSuccessRate = totalLogs > 0 ? Number((((totalLogs - errorActions) / totalLogs) * 100).toFixed(1)) : 100;

    return {
      totalAuditLogs: totalLogs,
      logsToday,
      logsThisWeek,
      uniqueActiveUsersThisWeek: uniqueUsers,
      byAction,
      byModule,
      activityTrend,
      peakHour,
      actionSuccessRate,
    };
  }

  private async getNotificationsMetrics(
    companyId: string,
    todayStart: Date
  ): Promise<OwnerDashboardStats['notifications']> {
    const users = await prisma.companyUser.findMany({
      where: { companyId, isActive: true },
      select: { userId: true },
    });
    const ids = users.map((u) => u.userId);
    if (!ids.length)
      return { total: 0, unread: 0, readRate: 0, byType: [], sentToday: 0 };

    const [total, unread, byType, sentToday] = await Promise.all([
      prisma.notification.count({ where: { userId: { in: ids } } }),
      prisma.notification.count({ where: { userId: { in: ids }, isRead: false } }),
      prisma.notification
        .groupBy({ by: ['type'], where: { userId: { in: ids } }, _count: { type: true } })
        .then((r) => r.map((x) => ({ type: x.type, count: x._count.type })).sort((a, b) => b.count - a.count)),
      prisma.notification.count({ where: { userId: { in: ids }, createdAt: { gte: todayStart } } }),
    ]);

    return {
      total,
      unread,
      readRate: total > 0 ? Number((((total - unread) / total) * 100).toFixed(1)) : 0,
      byType,
      sentToday,
    };
  }

  private async getDatabaseGrowthMetrics(companyId: string): Promise<OwnerDashboardStats['databaseGrowth']> {
    const counts = await Promise.all([
      prisma.user.count({ where: { companyUsers: { some: { companyId } } } }),
      prisma.customer.count({ where: { companyId, deletedAt: null } }),
      prisma.vendor.count({ where: { companyId, deletedAt: null } }),
      prisma.product.count({ where: { companyId, deletedAt: null } }),
      prisma.employee.count({ where: { companyId, deletedAt: null } }),
      prisma.asset.count({ where: { companyId, deletedAt: null } }),
      prisma.location.count({ where: { companyId, deletedAt: null } }),
      prisma.lease.count({ where: { companyId, deletedAt: null } }),
      prisma.transaction.count({ where: { companyId, deletedAt: null } }),
      prisma.purchase.count({ where: { companyId, deletedAt: null } }),
      prisma.production.count({ where: { companyId, deletedAt: null } }),
      prisma.warehouse.count({ where: { companyId, deletedAt: null } }),
      prisma.stock.count({ where: { warehouse: { companyId, deletedAt: null } } }),
      prisma.stockMovement.count({ where: { warehouse: { companyId, deletedAt: null } } }),
      prisma.auditLog.count({ where: { companyId } }),
      prisma.notification.count({ where: { user: { companyUsers: { some: { companyId } } } } }),
      prisma.document.count(),
      prisma.approval.count(),
    ]);

    const names = [
      'Pengguna', 'Pelanggan', 'Vendor', 'Produk', 'Karyawan', 'Aset', 'Lokasi',
      'Sewa', 'Transaksi', 'Pembelian', 'Produksi', 'Gudang', 'Stok',
      'Pergerakan Stok', 'Audit Log', 'Notifikasi', 'Dokumen', 'Persetujuan',
    ];

    return {
      tables: names
        .map((name, i) => ({ name, rows: counts[i] }))
        .sort((a, b) => b.rows - a.rows),
      totalRows: counts.reduce((s, c) => s + c, 0),
    };
  }

  private async getApprovalsMetrics(companyId: string): Promise<OwnerDashboardStats['approvals']> {
    const users = await prisma.companyUser.findMany({
      where: { companyId, isActive: true },
      select: { userId: true },
    });
    const ids = users.map((u) => u.userId);
    if (!ids.length) return { pending: 0, approved: 0, rejected: 0, approvalRate: 0 };

    const [pending, approved, rejected] = await Promise.all([
      prisma.approval.count({ where: { approverId: { in: ids }, status: 'pending' } }),
      prisma.approval.count({ where: { approverId: { in: ids }, status: 'approved' } }),
      prisma.approval.count({ where: { approverId: { in: ids }, status: 'rejected' } }),
    ]);

    const total = pending + approved + rejected;
    return {
      pending,
      approved,
      rejected,
      approvalRate: total > 0 ? Number(((approved / total) * 100).toFixed(1)) : 0,
    };
  }

  private async getTopEntitiesMetrics(
    companyId: string,
    weekStart: Date
  ): Promise<OwnerDashboardStats['topEntities']> {
    // Top customers by active lease value
    const customers = await prisma.customer.findMany({
      where: { companyId, deletedAt: null, leases: { some: { deletedAt: null, status: 'active' } } },
      select: { name: true, code: true, leases: { where: { deletedAt: null, status: 'active' }, select: { amount: true } } },
    });
    const topCustomersByLease = customers
      .map((r) => ({ name: r.name, code: r.code, leases: r.leases.length, value: r.leases.reduce((s, l) => s + Number(l.amount), 0) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Top products by stock value
    const stocks = await prisma.stock.findMany({
      where: { warehouse: { companyId, deletedAt: null } },
      select: { quantity: true, product: { select: { name: true, code: true, cost: true, price: true } } },
    });
    const prodMap = new Map<string, { name: string; code: string | null; quantity: number; value: number }>();
    for (const r of stocks) {
      const key = r.product.code || r.product.name;
      const ex = prodMap.get(key) || { name: r.product.name, code: r.product.code, quantity: 0, value: 0 };
      ex.quantity += Number(r.quantity);
      ex.value += Number(r.quantity) * Number(r.product.cost || r.product.price || 0);
      prodMap.set(key, ex);
    }
    const topProductsByStockValue = Array.from(prodMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Top users by activity this week
    const grouped = await prisma.auditLog.groupBy({
      by: ['userId'],
      where: { companyId, createdAt: { gte: weekStart } },
      _count: { userId: true },
    });
    const topUsersByActivity: OwnerDashboardStats['topEntities']['topUsersByActivity'] = [];
    if (grouped.length) {
      const us = await prisma.user.findMany({
        where: { id: { in: grouped.map((r) => r.userId) } },
        select: { id: true, name: true },
      });
      const nm = new Map(us.map((u) => [u.id, u.name]));
      topUsersByActivity.push(
        ...grouped
          .map((r) => ({ name: nm.get(r.userId) || 'Tidak diketahui', actions: r._count.userId }))
          .sort((a, b) => b.actions - a.actions)
          .slice(0, 5)
      );
    }

    // Top vendors by purchase value
    const vendors = await prisma.vendor.findMany({
      where: { companyId, deletedAt: null, purchases: { some: { deletedAt: null } } },
      select: { name: true, code: true, purchases: { where: { deletedAt: null }, select: { total: true } } },
    });
    const topVendorsByPurchase = vendors
      .map((r) => ({
        name: r.name,
        code: r.code,
        purchases: r.purchases.length,
        value: r.purchases.reduce((s, p) => s + Number(p.total || 0), 0),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Recent activity
    const recent = await prisma.auditLog.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, module: true, action: true, entityType: true, createdAt: true, user: { select: { name: true } } },
    });
    const recentActivity = recent.map((r) => ({
      id: r.id,
      userName: r.user?.name ?? 'Sistem',
      module: r.module,
      action: r.action,
      entityType: r.entityType,
      createdAt: r.createdAt.toISOString(),
    }));

    return { topCustomersByLease, topProductsByStockValue, topUsersByActivity, recentActivity, topVendorsByPurchase };
  }

  private async getHealthMetrics(companyId: string): Promise<OwnerDashboardStats['health']> {
    const [companiesCount, activeCompanies, rolesCount, permissionsConfigured, modulesEnabled] = await Promise.all([
      prisma.company.count({ where: { companyUsers: { some: { companyId } } } }),
      prisma.company.count({ where: { isActive: true, deletedAt: null } }),
      prisma.role.count({ where: { companyId, deletedAt: null } }),
      prisma.rolePermission.count({ where: { role: { companyId } } }),
      prisma.companyModule.count({ where: { companyId, isActive: true } }),
    ]);

    return {
      companiesCount,
      activeCompanies,
      rolesCount,
      permissionsConfigured,
      modulesEnabled,
      avgPermissionsPerRole: rolesCount > 0 ? Number((permissionsConfigured / rolesCount).toFixed(1)) : 0,
    };
  }

  // ── Generate actionable insights from computed metrics ───
  private buildInsights(data: {
    users: OwnerDashboardStats['users'];
    financial: OwnerDashboardStats['financial'];
    operations: OwnerDashboardStats['operations'];
    systemActivity: OwnerDashboardStats['systemActivity'];
    approvals: OwnerDashboardStats['approvals'];
  }): OwnerDashboardStats['insights'] {
    const insights: OwnerDashboardStats['insights'] = [];
    const { users, financial, operations, systemActivity, approvals } = data;

    // Revenue growth insight
    if (financial.incomeChangePct > 10) {
      insights.push({
        severity: 'success',
        icon: 'trend-up',
        title: 'Pertumbuhan Pendapatan Kuat',
        detail: `Pendapatan naik ${financial.incomeChangePct}% dibanding bulan lalu. Pertahankan momentum ini.`,
      });
    } else if (financial.incomeChangePct < -5) {
      insights.push({
        severity: 'danger',
        icon: 'trend-down',
        title: 'Penurunan Pendapatan',
        detail: `Pendapatan turun ${Math.abs(financial.incomeChangePct)}%. Tinjau strategi penjualan dan sewa aktif.`,
      });
    }

    // Expense ratio insight
    if (financial.expenseRatio > 80) {
      insights.push({
        severity: 'warning',
        icon: 'alert',
        title: 'Rasio Pengeluaran Tinggi',
        detail: `Pengeluaran mencapai ${financial.expenseRatio}% dari pendapatan. Optimalkan biaya operasional.`,
      });
    }

    // Lease expiry alert
    if (operations.expiringLeases > 0) {
      insights.push({
        severity: 'warning',
        icon: 'clock',
        title: 'Sewa Akan Berakhir',
        detail: `${operations.expiringLeases} kontrak sewa akan berakhir dalam 30 hari. Siapkan perpanjangan.`,
      });
    }

    // Pending approvals
    if (approvals.pending > 5) {
      insights.push({
        severity: 'warning',
        icon: 'inbox',
        title: 'Persetujuan Menumpuk',
        detail: `${approvals.pending} persetujuan menunggu diproses. Tingkatkan throughput approval.`,
      });
    }

    // User engagement
    if (users.mau > 0 && users.dau / users.mau < 0.1) {
      insights.push({
        severity: 'info',
        icon: 'users',
        title: 'Engagement Pengguna Rendah',
        detail: `Hanya ${Number(((users.dau / users.mau) * 100).toFixed(1))}% pengguna aktif harian. Pertimbangkan edukasi fitur.`,
      });
    } else if (users.dau / Math.max(users.mau, 1) > 0.4) {
      insights.push({
        severity: 'success',
        icon: 'users',
        title: 'Engagement Pengguna Tinggi',
        detail: `${Number(((users.dau / Math.max(users.mau, 1)) * 100).toFixed(1))}% pengguna aktif harian. Sistem digunakan dengan baik.`,
      });
    }

    // System activity
    if (systemActivity.logsToday === 0) {
      insights.push({
        severity: 'info',
        icon: 'activity',
        title: 'Aktivitas Sistem Hari Ini',
        detail: 'Belum ada aktivitas tercatat hari ini. Mungkin perlu verifikasi koneksi atau adopsi pengguna.',
      });
    }

    return insights;
  }
}