// src/routes.ts
// NEXORA ERP - Main Routes Registration
import { Router } from 'express';

// ===== CORE MODULES =====
import authRoutes from './modules/core/auth/auth.routes';
import userRoutes from './modules/core/user/user.routes';
import roleRoutes from './modules/core/role/role.routes';
import permissionRoutes from './modules/core/permission/permission.routes';
import auditRoutes from './modules/core/audit/audit.routes'; // ✅ ADDED
import codeRoutes from './modules/core/code/code.routes'; // ✅ ADDED

// ===== DATA MODULES =====
import customerRoutes from './modules/data/customer/customer.routes';
import vendorRoutes from './modules/data/vendor/vendor.routes';
import productRoutes from './modules/data/product/product.routes';
import employeeRoutes from './modules/data/employee/employee.routes';
import assetRoutes from './modules/data/asset/asset.routes';
import locationRoutes from './modules/data/location/location.routes';

// ===== OPERATIONS MODULES =====
import transactionRoutes from './modules/operations/transaction/transaction.routes';
import stockRoutes from './modules/operations/stock/stock.routes';
import leaseRoutes from './modules/operations/lease/lease.routes';
import productionRoutes from './modules/operations/production/production.routes';
import warehouseRoutes from './modules/operations/warehouse/warehouse.routes';

// ===== REPORTING MODULES =====
import reportRoutes from './modules/reporting/report/report.routes';

const router = Router();

// ============================================
// HEALTH CHECK
// ============================================
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'NEXORA API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    modules: {
      core: ['auth', 'user', 'role', 'permission', 'audit', 'code'], // ✅ ADDED audit and code
      data: ['customer', 'vendor', 'product', 'employee', 'asset', 'location'],
      operations: ['transaction', 'stock', 'lease', 'production', 'warehouse'],
      reporting: ['report'],
    },
  });
});

// ============================================
// CORE ROUTES
// ============================================
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/audit-logs', auditRoutes); // ✅ ADDED
router.use('/code-config', codeRoutes); // ✅ ADDED

// ============================================
// DATA ROUTES
// ============================================
router.use('/customers', customerRoutes);
router.use('/vendors', vendorRoutes);
router.use('/products', productRoutes);
router.use('/employees', employeeRoutes);
router.use('/assets', assetRoutes);
router.use('/locations', locationRoutes);

// ============================================
// OPERATIONS ROUTES
// ============================================
router.use('/transactions', transactionRoutes);
router.use('/stocks', stockRoutes);
router.use('/leases', leaseRoutes);
router.use('/productions', productionRoutes);
router.use('/warehouses', warehouseRoutes);

// ============================================
// REPORTING ROUTES
// ============================================
router.use('/reports', reportRoutes);

// ============================================
// 404 Handler
// ============================================
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /api/v1/health',
      'POST /api/v1/auth/login',
      'POST /api/v1/auth/register',
      'GET /api/v1/users',
      'GET /api/v1/audit-logs', // ✅ ADDED
      // ... other routes
    ],
  });
});

export default router;