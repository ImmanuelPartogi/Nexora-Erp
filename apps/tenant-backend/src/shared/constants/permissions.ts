// ============================================
// FILE: backend/src/shared/constants/permissions.ts
// 🎯 BACKEND VERSION - Permission definitions + MODULE grouping
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

export type PermissionType = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const MODULE_PERMISSIONS: Record<string, string[]> = {
  core: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.ROLE_VIEW,
    PERMISSIONS.ROLE_CREATE,
    PERMISSIONS.ROLE_EDIT,
    PERMISSIONS.ROLE_DELETE,
    PERMISSIONS.PERMISSION_VIEW,
    PERMISSIONS.PERMISSION_MANAGE,
    PERMISSIONS.COMPANY_VIEW,
    PERMISSIONS.COMPANY_EDIT,
    PERMISSIONS.MODULE_VIEW,
    PERMISSIONS.MODULE_MANAGE,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.AUDIT_EXPORT,
    PERMISSIONS.CODE_VIEW,
    PERMISSIONS.CODE_MANAGE,
  ],
  data: [
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.CUSTOMER_EDIT,
    PERMISSIONS.CUSTOMER_DELETE,
    PERMISSIONS.VENDOR_VIEW,
    PERMISSIONS.VENDOR_CREATE,
    PERMISSIONS.VENDOR_EDIT,
    PERMISSIONS.VENDOR_DELETE,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_EDIT,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.ASSET_VIEW,
    PERMISSIONS.ASSET_CREATE,
    PERMISSIONS.ASSET_EDIT,
    PERMISSIONS.ASSET_DELETE,
    PERMISSIONS.LOCATION_VIEW,
    PERMISSIONS.LOCATION_CREATE,
    PERMISSIONS.LOCATION_EDIT, 
    PERMISSIONS.LOCATION_DELETE,
    PERMISSIONS.EMPLOYEE_VIEW,
    PERMISSIONS.EMPLOYEE_CREATE,
    PERMISSIONS.EMPLOYEE_EDIT,
    PERMISSIONS.EMPLOYEE_DELETE,
  ],
  operations: [
    PERMISSIONS.LEASE_VIEW,
    PERMISSIONS.LEASE_CREATE,
    PERMISSIONS.LEASE_EDIT,
    PERMISSIONS.LEASE_DELETE,
    PERMISSIONS.LEASE_APPROVE,
    PERMISSIONS.STOCK_VIEW,
    PERMISSIONS.STOCK_CREATE,
    PERMISSIONS.STOCK_EDIT,
    PERMISSIONS.STOCK_ADJUST,
    PERMISSIONS.WAREHOUSE_VIEW,
    PERMISSIONS.WAREHOUSE_CREATE,
    PERMISSIONS.WAREHOUSE_EDIT,
    PERMISSIONS.WAREHOUSE_DELETE,
    PERMISSIONS.PRODUCTION_VIEW,
    PERMISSIONS.PRODUCTION_CREATE,
    PERMISSIONS.PRODUCTION_EDIT,
    PERMISSIONS.PRODUCTION_DELETE,
    PERMISSIONS.PRODUCTION_APPROVE,
    PERMISSIONS.TRANSACTION_VIEW,
    PERMISSIONS.TRANSACTION_CREATE,
    PERMISSIONS.TRANSACTION_EDIT,
    PERMISSIONS.TRANSACTION_DELETE,
    PERMISSIONS.TRANSACTION_APPROVE,
    PERMISSIONS.PURCHASE_VIEW,
    PERMISSIONS.PURCHASE_CREATE,
    PERMISSIONS.PURCHASE_EDIT,
    PERMISSIONS.PURCHASE_DELETE,
    PERMISSIONS.PURCHASE_APPROVE,
    PERMISSIONS.OPERATION_POINT_VIEW,
    PERMISSIONS.OPERATION_POINT_CREATE,
    PERMISSIONS.OPERATION_POINT_EDIT,
    PERMISSIONS.OPERATION_POINT_DELETE,
  ],
  reporting: [
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.REPORT_ADVANCED,
  ],
};
