// ============================================
// FILE: frontend/src/shared/types/owner-dashboard.types.ts
// Owner Dashboard analytics types — synced with backend
// ============================================

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
    total: number;
    active: number;
    inactive: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
    verifiedRate: number;
    trend: TrendPoint[];
    byRole: { role: string; count: number }[];
    byStatus: { status: string; count: number }[];
    retentionRate: number;
    dau: number;
    wau: number;
    mau: number;
    newVsReturning: { label: string; value: number }[];
  };
  masterData: {
    customers: ChangeMetric;
    vendors: ChangeMetric;
    products: ChangeMetric;
    employees: ChangeMetric;
    assets: ChangeMetric;
    locations: ChangeMetric;
    totalRecords: number;
  };
  financial: {
    incomeThisMonth: number;
    expenseThisMonth: number;
    netThisMonth: number;
    incomeLastMonth: number;
    expenseLastMonth: number;
    netLastMonth: number;
    incomeChangePct: number;
    expenseChangePct: number;
    netChangePct: number;
    totalTransactions: number;
    pendingApprovals: number;
    approvedTransactions: number;
    monthlyTrend: TrendPoint[];
    byCategory: { category: string; income: number; expense: number }[];
    avgTransactionValue: number;
    expenseRatio: number;
    ytdIncome: number;
    ytdExpense: number;
    ytdNet: number;
  };
  operations: {
    activeLeases: number;
    expiringLeases: number;
    totalLeaseValue: number;
    openPurchases: number;
    completedProductions: number;
    pendingProductions: number;
    stockMovementsThisMonth: number;
    warehouses: number;
    productionTrend: TrendPoint[];
    transactionTrend: TrendPoint[];
    avgLeaseValue: number;
    productionCompletionRate: number;
  };
  systemActivity: {
    totalAuditLogs: number;
    logsToday: number;
    logsThisWeek: number;
    uniqueActiveUsersThisWeek: number;
    byAction: { action: string; count: number }[];
    byModule: { module: string; count: number }[];
    activityTrend: TrendPoint[];
    peakHour: number;
    actionSuccessRate: number;
  };
  notifications: {
    total: number;
    unread: number;
    readRate: number;
    byType: { type: string; count: number }[];
    sentToday: number;
  };
  databaseGrowth: { tables: { name: string; rows: number }[]; totalRows: number };
  approvals: {
    pending: number;
    approved: number;
    rejected: number;
    approvalRate: number;
  };
  topEntities: {
    topCustomersByLease: {
      name: string;
      code: string | null;
      leases: number;
      value: number;
    }[];
    topProductsByStockValue: {
      name: string;
      code: string | null;
      quantity: number;
      value: number;
    }[];
    topUsersByActivity: { name: string; actions: number }[];
    recentActivity: {
      id: string;
      userName: string;
      module: string;
      action: string;
      entityType: string;
      createdAt: string;
    }[];
    topVendorsByPurchase: {
      name: string;
      code: string | null;
      purchases: number;
      value: number;
    }[];
  };
  health: {
    companiesCount: number;
    activeCompanies: number;
    rolesCount: number;
    permissionsConfigured: number;
    modulesEnabled: number;
    avgPermissionsPerRole: number;
  };
  insights: {
    severity: 'info' | 'warning' | 'success' | 'danger';
    icon: string;
    title: string;
    detail: string;
  }[];
}