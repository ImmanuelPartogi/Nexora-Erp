// ============================================
// FILE: frontend/src/shared/types/index.ts
// Complete types for NEXORA ERP
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  industryType?: string;
  isActive: boolean;
}

export interface CompanyAccess {
  id: string;
  name: string;
  role: string;
  permissions?: string[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  companies: CompanyAccess[];
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}

// Core Layer Types
export interface PermissionGroup {
  module: string;
  moduleName: string;
  permissions: string[];
}

export interface Role {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  permissions: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  code: string;
  name: string;
  layer: string;
  description?: string;
}

export interface CompanyModule {
  id: string;
  companyId: string;
  moduleId: string;
  isActive: boolean;
}

// Data Layer Types
export interface Customer {
  id: string;
  companyId: string;
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  companyId: string;
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  companyId: string;
  name: string;
  code?: string;
  type: 'goods' | 'service' | 'raw_material' | 'finished_goods';
  category?: string;
  unit?: string;
  price?: number;
  cost?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy?: string;
  deletedAt?: string;
}

export interface Asset {
  id: string;
  companyId: string;
  name: string;
  code?: string;
  type?: 'equipment' | 'vehicle' | 'building' | 'furniture' | 'other';
  category?: string;
  locationId?: string;
  locationName?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'maintenance';
  description?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  companyId: string;
  name: string;
  code?: string;
  address?: string;
  type?: 'warehouse' | 'office' | 'store' | 'other';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  companyId: string;
  userId?: string;
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  joinDate?: string;
  salary?: number;
  status: 'active' | 'inactive' | 'resigned';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    isActive: boolean;
    role?: {
      id: string;
      name: string;
    };
  };
}

// Operations Layer Types
export interface Lease {
  id: string;
  companyId: string;
  customerId: string;
  customerName?: string;
  unitId?: string;
  unitName?: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  companyId: string;
  name: string;
  code?: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Stock {
  id: string;
  companyId: string;
  productId: string;
  productName?: string;
  productUnit?: string;
  warehouseId: string;
  warehouseName?: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  companyId: string;
  productId: string;
  productName?: string;
  warehouseId: string;
  warehouseName?: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  referenceNo?: string;
  notes?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  companyId: string;
  type: 'income' | 'expense';
  category?: string;
  amount: number;
  date: string;
  description?: string;
  referenceNo?: string;
  status: 'draft' | 'approved' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Production {
  id: string;
  companyId: string;
  batchNo?: string;
  productId: string;
  productName?: string;
  quantity: number;
  date: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionItem {
  id: string;
  productionId: string;
  productId: string;
  productName?: string;
  quantity: number;
  type: 'input' | 'output';
}

// Reporting Types
export interface ReportParams {
  startDate?: string;
  endDate?: string;
  customerId?: string;
  productId?: string;
  warehouseId?: string;
  type?: string;
  status?: string;
  format?: 'json' | 'pdf' | 'excel' | 'csv';
}

export interface ReportSummary {
  totalRevenue?: number;
  totalExpense?: number;
  profit?: number;
  totalCustomers?: number;
  totalVendors?: number;
  totalProducts?: number;
  activeLeases?: number;
  stockValue?: number;
  lowStockItems?: number;
}

// 🔐 Permission-scoped dashboard. Sections are optional because the backend only
// returns metrics the caller is authorized to see (principle of least privilege).
export interface DashboardStats {
  scope: {
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
  };
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
  // 🔒 Only present for roles with transactions.view permission.
  financial?: {
    todayTransactions: number;
    monthlyRevenue: number;
    monthlyExpense: number;
    netCashflow: number;
  };
  timestamp: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName?: string;
  companyId: string;
  module: string;
  action: string;
  recordId?: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}
