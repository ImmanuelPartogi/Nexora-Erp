// ============================================
// FILE: web-app/src/shared/types/index.ts
// Types aligned with backend response shapes.
// ============================================

// ---------- Generic API wrappers ----------
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// ---------- Auth ----------
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface CompanyAccess {
  id: string;
  name: string;
  role: string;
  permissions?: string[];
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  companies: CompanyAccess[];
  permissions: string[];
}

// ---------- Operations ----------
export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'draft' | 'approved';

export interface Transaction {
  id: string;
  companyId: string;
  code?: string | null;
  type: TransactionType;
  category?: string | null;
  amount: number;
  date: string;
  status: string;
  description?: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy?: string | null;
  deletedAt?: string | null;
}

export interface TransactionListQuery {
  page?: number;
  limit?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Stock {
  id: string;
  companyId: string;
  productId: string;
  productName: string;
  productCode?: string | null;
  productUnit?: string | null;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  updatedAt: string;
}

export interface StockListQuery {
  page?: number;
  limit?: number;
  warehouseId?: string;
  productId?: string;
  search?: string;
}

export interface Warehouse {
  id: string;
  companyId: string;
  name: string;
  code?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------- Reporting (Dashboard) ----------
export interface DashboardScope {
  customers: boolean;
  vendors: boolean;
  products: boolean;
  employees: boolean;
  assets: boolean;
  locations: boolean;
  leases: boolean;
  warehouses: boolean;
  stock: boolean;
  production: boolean;
  transactions: boolean;
  purchases: boolean;
}

export interface DashboardStats {
  scope: DashboardScope;
  summary: {
    customers?: number;
    vendors?: number;
    products?: number;
    employees?: number;
    assets?: number;
  };
  operations: {
    activeLeases?: number;
    warehouses?: number;
    stockItems?: number;
    monthlyProductions?: number;
    monthlyPurchases?: number;
  };
  financial?: {
    todayTransactions: number;
    monthlyRevenue: number;
    monthlyExpense: number;
    netCashflow: number;
  };
  timestamp: string;
}