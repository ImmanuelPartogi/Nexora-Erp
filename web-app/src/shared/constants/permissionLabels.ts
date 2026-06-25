// ============================================
// FILE: web-app/src/shared/constants/permissionLabels.ts
// Human-readable labels & descriptions for every permission code
// defined in permissions.ts. Used by the Role permission modal
// and anywhere a permission needs a friendly description.
// ============================================

export interface PermissionMeta {
  /** Short human label (e.g. "Create Customer") */
  label: string;
  /** One-sentence explanation of what the permission allows */
  description: string;
}

/**
 * Mapping of every permission code -> { label, description }.
 * Keep this in sync with PERMISSIONS in permissions.ts and the
 * backend seed module definitions.
 */
export const PERMISSION_LABELS: Record<string, PermissionMeta> = {
  // ── Core: Users ───────────────────────────────────────────────
  'core.user.view':        { label: 'View Users',        description: 'Allows the user to see the list of system users and their details.' },
  'core.user.create':      { label: 'Create User',       description: 'Allows the user to add new system user accounts to the company.' },
  'core.user.edit':        { label: 'Edit User',         description: 'Allows the user to modify existing system user information.' },
  'core.user.delete':      { label: 'Delete User',       description: 'Allows the user to remove or deactivate system user accounts.' },

  // ── Core: Roles ───────────────────────────────────────────────
  'core.role.view':        { label: 'View Roles',        description: 'Allows the user to view the list of roles and their assigned permissions.' },
  'core.role.create':      { label: 'Create Role',       description: 'Allows the user to create new roles within the company.' },
  'core.role.edit':        { label: 'Edit Role',         description: 'Allows the user to modify a role and change its assigned permissions.' },
  'core.role.delete':      { label: 'Delete Role',       description: 'Allows the user to delete roles that are not protected (e.g. Owner).' },

  // ── Core: Permissions ─────────────────────────────────────────
  'core.permission.view':  { label: 'View Permissions',  description: 'Allows the user to view the catalog of available permissions.' },
  'core.permission.manage':{ label: 'Manage Permissions',description: 'Allows the user to assign and revoke permissions on roles.' },

  // ── Core: Company ─────────────────────────────────────────────
  'core.company.view':     { label: 'View Company',      description: 'Allows the user to view the company profile and settings.' },
  'core.company.edit':     { label: 'Edit Company',      description: 'Allows the user to update the company profile and industry information.' },

  // ── Core: Modules ─────────────────────────────────────────────
  'core.module.view':      { label: 'View Modules',      description: 'Allows the user to see which modules are enabled for the company.' },
  'core.module.manage':    { label: 'Manage Modules',    description: 'Allows the user to enable or disable modules for the company.' },

  // ── Core: Audit ───────────────────────────────────────────────
  'core.audit.view':       { label: 'View Audit Log',    description: 'Allows the user to view the audit trail of system activity.' },
  'core.audit.export':     { label: 'Export Audit Log',  description: 'Allows the user to export the audit log to a file.' },

  // ── Core: Code Config ─────────────────────────────────────────
  'core.code.view':        { label: 'View Code Config',  description: 'Allows the user to view the automatic code/prefix configuration.' },
  'core.code.manage':      { label: 'Manage Code Config',description: 'Allows the user to edit entity code prefixes and digit counts.' },

  // ── Master Data: Customers ────────────────────────────────────
  'data.customer.view':    { label: 'View Customers',    description: 'Allows the user to view the customer directory.' },
  'data.customer.create':  { label: 'Create Customer',   description: 'Allows the user to add new customer records to the company.' },
  'data.customer.edit':    { label: 'Edit Customer',     description: 'Allows the user to modify existing customer information.' },
  'data.customer.delete':  { label: 'Delete Customer',   description: 'Allows the user to delete customer records from the company.' },

  // ── Master Data: Vendors ──────────────────────────────────────
  'data.vendor.view':      { label: 'View Vendors',      description: 'Allows the user to view the vendor and supplier directory.' },
  'data.vendor.create':    { label: 'Create Vendor',     description: 'Allows the user to add new vendor or supplier records.' },
  'data.vendor.edit':      { label: 'Edit Vendor',       description: 'Allows the user to modify existing vendor information.' },
  'data.vendor.delete':    { label: 'Delete Vendor',     description: 'Allows the user to delete vendor records from the company.' },

  // ── Master Data: Products ─────────────────────────────────────
  'data.product.view':     { label: 'View Products',     description: 'Allows the user to view the product catalog.' },
  'data.product.create':   { label: 'Create Product',    description: 'Allows the user to add new products to the catalog.' },
  'data.product.edit':     { label: 'Edit Product',      description: 'Allows the user to modify existing product details and pricing.' },
  'data.product.delete':   { label: 'Delete Product',    description: 'Allows the user to remove products from the catalog.' },

  // ── Master Data: Assets ───────────────────────────────────────
  'data.asset.view':       { label: 'View Assets',       description: 'Allows the user to view the company asset register.' },
  'data.asset.create':     { label: 'Create Asset',      description: 'Allows the user to register new company assets.' },
  'data.asset.edit':       { label: 'Edit Asset',        description: 'Allows the user to modify existing asset records.' },
  'data.asset.delete':     { label: 'Delete Asset',      description: 'Allows the user to remove assets from the register.' },

  // ── Master Data: Locations ────────────────────────────────────
  'data.location.view':    { label: 'View Locations',    description: 'Allows the user to view the list of branches and locations.' },
  'data.location.create':  { label: 'Create Location',   description: 'Allows the user to add new offices, branches, or warehouses.' },
  'data.location.edit':    { label: 'Edit Location',     description: 'Allows the user to modify existing location information.' },
  'data.location.delete':  { label: 'Delete Location',   description: 'Allows the user to remove locations from the company.' },

  // ── Master Data: Employees ────────────────────────────────────
  'data.employee.view':    { label: 'View Employees',    description: 'Allows the user to view the employee directory.' },
  'data.employee.create':  { label: 'Create Employee',   description: 'Allows the user to add new employee records.' },
  'data.employee.edit':    { label: 'Edit Employee',     description: 'Allows the user to modify existing employee information.' },
  'data.employee.delete':  { label: 'Delete Employee',   description: 'Allows the user to remove employee records from the company.' },

  // ── Operations: Leases ────────────────────────────────────────
  'operations.lease.view':    { label: 'View Leases',    description: 'Allows the user to view rental and lease contracts.' },
  'operations.lease.create':  { label: 'Create Lease',   description: 'Allows the user to create new lease agreements.' },
  'operations.lease.edit':    { label: 'Edit Lease',     description: 'Allows the user to modify existing lease contracts.' },
  'operations.lease.delete':  { label: 'Delete Lease',   description: 'Allows the user to cancel or delete lease contracts.' },
  'operations.lease.approve': { label: 'Approve Lease',  description: 'Allows the user to approve or reject lease contracts.' },

  // ── Operations: Stock ─────────────────────────────────────────
  'operations.stock.view':   { label: 'View Stock',      description: 'Allows the user to view current stock levels across warehouses.' },
  'operations.stock.create': { label: 'Stock In/Out',    description: 'Allows the user to record stock-in and stock-out movements.' },
  'operations.stock.edit':   { label: 'Edit Stock',      description: 'Allows the user to edit existing stock movement records.' },
  'operations.stock.adjust': { label: 'Adjust Stock',    description: 'Allows the user to perform manual stock adjustments/corrections.' },

  // ── Operations: Warehouses ────────────────────────────────────
  'operations.warehouse.view':   { label: 'View Warehouses',  description: 'Allows the user to view the list of warehouses.' },
  'operations.warehouse.create': { label: 'Create Warehouse', description: 'Allows the user to add new warehouses.' },
  'operations.warehouse.edit':   { label: 'Edit Warehouse',   description: 'Allows the user to modify existing warehouse information.' },
  'operations.warehouse.delete': { label: 'Delete Warehouse', description: 'Allows the user to remove warehouses from the company.' },

  // ── Operations: Production ────────────────────────────────────
  'operations.production.view':    { label: 'View Production',  description: 'Allows the user to view production batches.' },
  'operations.production.create':  { label: 'Create Production',description: 'Allows the user to create new production batches.' },
  'operations.production.edit':    { label: 'Edit Production',  description: 'Allows the user to modify production batches and update status.' },
  'operations.production.delete':  { label: 'Delete Production',description: 'Allows the user to delete production batches.' },
  'operations.production.approve': { label: 'Approve Production',description: 'Allows the user to approve and complete production batches.' },

  // ── Operations: Transactions ──────────────────────────────────
  'operations.transaction.view':    { label: 'View Transactions',  description: 'Allows the user to view financial transactions.' },
  'operations.transaction.create':  { label: 'Create Transaction', description: 'Allows the user to record new income or expense transactions.' },
  'operations.transaction.edit':    { label: 'Edit Transaction',   description: 'Allows the user to modify existing transactions.' },
  'operations.transaction.delete':  { label: 'Delete Transaction', description: 'Allows the user to delete transactions from the ledger.' },
  'operations.transaction.approve': { label: 'Approve Transaction',description: 'Allows the user to approve or reject pending transactions.' },

  // ── Operations: Purchases ──────────────────────────────────────
  'operations.purchase.view':    { label: 'View Purchases',  description: 'Allows the user to view purchase orders.' },
  'operations.purchase.create':  { label: 'Create Purchase', description: 'Allows the user to create new purchase orders.' },
  'operations.purchase.edit':    { label: 'Edit Purchase',   description: 'Allows the user to modify existing purchase orders.' },
  'operations.purchase.delete':  { label: 'Delete Purchase', description: 'Allows the user to delete purchase orders.' },
  'operations.purchase.approve': { label: 'Approve Purchase',description: 'Allows the user to approve purchase orders.' },

  // ── Operations: Operation Points ───────────────────────────────
  'operations.point.view':   { label: 'View Operation Points', description: 'Allows the user to view branches, outlets, and POS points.' },
  'operations.point.create': { label: 'Create Operation Point',description: 'Allows the user to add new operation points.' },
  'operations.point.edit':   { label: 'Edit Operation Point',  description: 'Allows the user to modify existing operation points.' },
  'operations.point.delete': { label: 'Delete Operation Point',description: 'Allows the user to remove operation points.' },

  // ── Reporting ─────────────────────────────────────────────────
  'reporting.report.view':     { label: 'View Reports',      description: 'Allows the user to view standard business reports.' },
  'reporting.report.export':   { label: 'Export Reports',     description: 'Allows the user to export reports to PDF, Excel, or CSV.' },
  'reporting.report.advanced': { label: 'Advanced Reports',   description: 'Allows the user to access advanced analytics and custom reports.' },
};

// ── Group definitions ──────────────────────────────────────────
export interface PermissionGroup {
  /** Prefix used to match permission codes (e.g. 'core') */
  prefix: string;
  /** Human-readable group label shown in the UI */
  label: string;
}

/** Ordered list of permission groups rendered in the modal. */
export const PERMISSION_GROUPS: PermissionGroup[] = [
  { prefix: 'core',       label: 'Core' },
  { prefix: 'data',       label: 'Master Data' },
  { prefix: 'operations', label: 'Operations' },
  { prefix: 'reporting',  label: 'Reporting' },
];

/**
 * Returns the group label for a given permission code.
 * Falls back to the top-level prefix capitalized.
 */
export function getPermissionGroup(code: string): string {
  const prefix = code.split('.')[0];
  const group = PERMISSION_GROUPS.find((g) => g.prefix === prefix);
  return group?.label ?? prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

/**
 * Returns the label for a permission code, falling back to the
 * raw code if no friendly label is defined.
 */
export function getPermissionLabel(code: string): string {
  return PERMISSION_LABELS[code]?.label ?? code;
}

/**
 * Returns the description for a permission code, falling back to
 * an empty string if not defined.
 */
export function getPermissionDescription(code: string): string {
  return PERMISSION_LABELS[code]?.description ?? '';
}