// ============================================
// COMPLETE ROUTER - ALL ROUTES (100%)
// FILE: src/app/router.tsx - FINAL VERSION
// ============================================
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Layout } from './Layout';

// Auth
import { LoginPage } from '@/modules/core/auth/pages/LoginPage';
import { RegisterPage } from '@/modules/core/auth/pages/RegisterPage';
import { SelectCompanyPage } from '@/modules/core/auth/pages/SelectCompanyPage';

// Dashboard
import { DashboardPage } from '@/modules/core/dashboard/pages/DashboardPage';

// Data Layer
import { CustomerListPage } from '@/modules/data/customer/pages/CustomerListPage';
import { CustomerDetailPage } from '@/modules/data/customer/pages/CustomerDetailPage';
import { VendorListPage } from '@/modules/data/vendor/pages/VendorListPage';
import { VendorDetailPage } from '@/modules/data/vendor/pages/VendorDetailPage';
import { ProductListPage } from '@/modules/data/product/pages/ProductListPage';
import { ProductDetailPage } from '@/modules/data/product/pages/ProductDetailPage';
import { AssetListPage } from '@/modules/data/asset/pages/AssetListPage';
import { AssetDetailPage } from '@/modules/data/asset/pages/AssetDetailPage';
import { LocationListPage } from '@/modules/data/location/pages/LocationListPage';
import { LocationDetailPage } from '@/modules/data/location/pages/LocationDetailPage';
import { EmployeeListPage } from '@/modules/data/employee/pages/EmployeeListPage';
import { EmployeeDetailPage } from '@/modules/data/employee/pages/EmployeeDetailPage';

// Operations Layer
import { LeaseListPage } from '@/modules/operations/lease/pages/LeaseListPage';
import { LeaseDetailPage } from '@/modules/operations/lease/pages/LeaseDetailPage';
import { StockListPage } from '@/modules/operations/stock/pages/StockListPage';
import { StockMovementPage } from '@/modules/operations/stock/pages/StockMovementPage';
import { TransactionListPage } from '@/modules/operations/transaction/pages/TransactionListPage';
import { TransactionDetailPage } from '@/modules/operations/transaction/pages/TransactionDetailPage';
import { WarehouseListPage } from '@/modules/operations/warehouse/pages/WarehouseListPage';
import { ProductionListPage } from '@/modules/operations/production/pages/ProductionListPage';

// Reporting
import { ReportListPage } from '@/modules/reporting/pages/ReportListPage';

// Core Management
import { RoleListPage } from '@/modules/core/role/pages/RoleListPage';
import CodeConfigListPage from '@/modules/core/code/pages/CodeConfigListPage';
import { AuditLogPage } from '@/modules/core/audit/pages/AuditLogPage';

export const router = createBrowserRouter([
  // PUBLIC ROUTES
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/select-company',
    element: <SelectCompanyPage />,
  },

  // PROTECTED ROUTES
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout>
          <Navigate to="/dashboard" replace />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Layout>
          <DashboardPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // DATA LAYER - CUSTOMER
  {
    path: '/customers',
    element: (
      <ProtectedRoute>
        <Layout>
          <CustomerListPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/customers/:id',
    element: (
      <ProtectedRoute>
        <Layout>
          <CustomerDetailPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // DATA LAYER - VENDOR
  {
    path: '/vendors',
    element: (
      <ProtectedRoute>
        <Layout>
          <VendorListPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/vendors/:id',
    element: (
      <ProtectedRoute>
        <Layout>
          <VendorDetailPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // DATA LAYER - PRODUCT
  {
    path: '/products',
    element: (
      <ProtectedRoute>
        <Layout>
          <ProductListPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/products/:id',
    element: (
      <ProtectedRoute>
        <Layout>
          <ProductDetailPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // DATA LAYER - ASSET
  {
    path: '/assets',
    element: (
      <ProtectedRoute>
        <Layout>
          <AssetListPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/assets/:id',
    element: (
      <ProtectedRoute>
        <Layout>
          <AssetDetailPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // DATA LAYER - LOCATION
  {
    path: '/locations',
    element: (
      <ProtectedRoute>
        <Layout>
          <LocationListPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/locations/:id',
    element: (
      <ProtectedRoute>
        <Layout>
          <LocationDetailPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // DATA LAYER - EMPLOYEE
  {
    path: '/employees',
    element: (
      <ProtectedRoute>
        <Layout>
          <EmployeeListPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/employees/:id',
    element: (
      <ProtectedRoute>
        <Layout>
          <EmployeeDetailPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // OPERATIONS - LEASE
  {
    path: '/leases',
    element: (
      <ProtectedRoute>
        <Layout>
          <LeaseListPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/leases/:id',
    element: (
      <ProtectedRoute>
        <Layout>
          <LeaseDetailPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // OPERATIONS - STOCK
  {
    path: '/stocks',
    element: (
      <ProtectedRoute>
        <Layout>
          <StockListPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/stocks/movements',
    element: (
      <ProtectedRoute>
        <Layout>
          <StockMovementPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // OPERATIONS - PURCHASE
  {
    path: '/purchases',
    element: (
      <ProtectedRoute>
        <Layout>
          <TransactionListPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/purchases/:id',
    element: (
      <ProtectedRoute>
        <Layout>
          <TransactionDetailPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // OPERATIONS - SALES
  {
    path: '/sales',
    element: (
      <ProtectedRoute>
        <Layout>
          <TransactionListPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/sales/:id',
    element: (
      <ProtectedRoute>
        <Layout>
          <TransactionDetailPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // OPERATIONS - TRANSACTION
  {
    path: '/transactions',
    element: (
      <ProtectedRoute>
        <Layout>
          <TransactionListPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/transactions/:id',
    element: (
      <ProtectedRoute>
        <Layout>
          <TransactionDetailPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // OPERATIONS - WAREHOUSE
  {
    path: '/warehouses',
    element: (
      <ProtectedRoute>
        <Layout>
          <WarehouseListPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // OPERATIONS - PRODUCTION
  {
    path: '/production',
    element: (
      <ProtectedRoute>
        <Layout>
          <ProductionListPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // REPORTING
  {
    path: '/reports',
    element: (
      <ProtectedRoute>
        <Layout>
          <ReportListPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  // CORE MANAGEMENT
  {
    path: '/roles',
    element: (
      <ProtectedRoute>
        <Layout>
          <RoleListPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/code-config',
    element: (
      <ProtectedRoute>
        <Layout>
          <CodeConfigListPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/audit-logs',
    element: (
      <ProtectedRoute>
        <Layout>
          <AuditLogPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
]);