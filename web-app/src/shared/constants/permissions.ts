// ============================================
// FILE: web-app/src/shared/constants/permissions.ts
// 🎯 Web-app version - Mirror dari backend (HARUS IDENTIK)
// ⚠️ TIDAK ADA MODULE_PERMISSIONS (khusus backend)
// ============================================

export const PERMISSIONS = {
  // Core permissions
  USER_VIEW: 'core.user.view',
  USER_CREATE: 'core.user.create',
  USER_EDIT: 'core.user.edit',
  USER_DELETE: 'core.user.delete',

  ROLE_VIEW: 'core.role.view',
  ROLE_CREATE: 'core.role.create',
  ROLE_EDIT: 'core.role.edit',
  ROLE_DELETE: 'core.role.delete',

  PERMISSION_VIEW: 'core.permission.view',
  PERMISSION_MANAGE: 'core.permission.manage',

  COMPANY_VIEW: 'core.company.view',
  COMPANY_EDIT: 'core.company.edit',

  MODULE_VIEW: 'core.module.view',
  MODULE_MANAGE: 'core.module.manage',

  AUDIT_VIEW: 'core.audit.view',
  AUDIT_EXPORT: 'core.audit.export',

  CODE_VIEW: 'core.code.view',
  CODE_MANAGE: 'core.code.manage',

  // Data permissions
  CUSTOMER_VIEW: 'data.customer.view',
  CUSTOMER_CREATE: 'data.customer.create',
  CUSTOMER_EDIT: 'data.customer.edit',
  CUSTOMER_DELETE: 'data.customer.delete',

  VENDOR_VIEW: 'data.vendor.view',
  VENDOR_CREATE: 'data.vendor.create',
  VENDOR_EDIT: 'data.vendor.edit',
  VENDOR_DELETE: 'data.vendor.delete',

  PRODUCT_VIEW: 'data.product.view',
  PRODUCT_CREATE: 'data.product.create',
  PRODUCT_EDIT: 'data.product.edit',
  PRODUCT_DELETE: 'data.product.delete',

  ASSET_VIEW: 'data.asset.view',
  ASSET_CREATE: 'data.asset.create',
  ASSET_EDIT: 'data.asset.edit',
  ASSET_DELETE: 'data.asset.delete',

  LOCATION_VIEW: 'data.location.view',
  LOCATION_CREATE: 'data.location.create',
  LOCATION_EDIT: 'data.location.edit',
  LOCATION_DELETE: 'data.location.delete',

  EMPLOYEE_VIEW: 'data.employee.view',
  EMPLOYEE_CREATE: 'data.employee.create',
  EMPLOYEE_EDIT: 'data.employee.edit',
  EMPLOYEE_DELETE: 'data.employee.delete',

  // Operations permissions
  LEASE_VIEW: 'operations.lease.view',
  LEASE_CREATE: 'operations.lease.create',
  LEASE_EDIT: 'operations.lease.edit',
  LEASE_DELETE: 'operations.lease.delete',
  LEASE_APPROVE: 'operations.lease.approve',

  STOCK_VIEW: 'operations.stock.view',
  STOCK_CREATE: 'operations.stock.create',
  STOCK_EDIT: 'operations.stock.edit',
  STOCK_ADJUST: 'operations.stock.adjust',

  WAREHOUSE_VIEW: 'operations.warehouse.view',
  WAREHOUSE_CREATE: 'operations.warehouse.create',
  WAREHOUSE_EDIT: 'operations.warehouse.edit',
  WAREHOUSE_DELETE: 'operations.warehouse.delete',

  PRODUCTION_VIEW: 'operations.production.view',
  PRODUCTION_CREATE: 'operations.production.create',
  PRODUCTION_EDIT: 'operations.production.edit',
  PRODUCTION_DELETE: 'operations.production.delete',
  PRODUCTION_APPROVE: 'operations.production.approve',

  TRANSACTION_VIEW: 'operations.transaction.view',
  TRANSACTION_CREATE: 'operations.transaction.create',
  TRANSACTION_EDIT: 'operations.transaction.edit',
  TRANSACTION_DELETE: 'operations.transaction.delete',
  TRANSACTION_APPROVE: 'operations.transaction.approve',

  PURCHASE_VIEW: 'operations.purchase.view',
  PURCHASE_CREATE: 'operations.purchase.create',
  PURCHASE_EDIT: 'operations.purchase.edit',
  PURCHASE_DELETE: 'operations.purchase.delete',
  PURCHASE_APPROVE: 'operations.purchase.approve',

  OPERATION_POINT_VIEW: 'operations.point.view',
  OPERATION_POINT_CREATE: 'operations.point.create',
  OPERATION_POINT_EDIT: 'operations.point.edit',
  OPERATION_POINT_DELETE: 'operations.point.delete',

  // Reporting permissions
  REPORT_VIEW: 'reporting.report.view',
  REPORT_EXPORT: 'reporting.report.export',
  REPORT_ADVANCED: 'reporting.report.advanced',
} as const;

export type PermissionType = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];