// ============================================
// FILE: backend/src/modules/core/role/role.types.ts
// FIX: Use "permissions" with string codes consistently
// ============================================

/**
 * ✅ Request type for creating a role
 * Matches validation schema + service expectations
 */
export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[]; // ✅ Permission codes (e.g., ["customers.view", "products.create"])
}

/**
 * ✅ Request type for updating a role
 */
export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[]; // ✅ Permission codes
}

/**
 * ✅ Query params for listing roles
 */
export interface RoleListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}