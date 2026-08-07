// ============================================
// FILE: backend/src/modules/core/role/role.validation.ts
// FIX: Use "permissions" with string codes, not "permissionIds" with UUIDs
// ============================================

import { z } from 'zod';

/**
 * ✅ Validation schema for creating a role
 * Permissions should be permission codes (e.g., "customers.view")
 * NOT permission IDs (UUIDs)
 */
export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  permissions: z
    .array(z.string())
    .min(1, 'At least one permission is required')
    .refine(
      (permissions) => permissions.every((p) => p.includes('.')),
      'Invalid permission format. Expected format: "module.action"'
    ),
});

/**
 * ✅ Validation schema for updating a role
 */
export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  permissions: z
    .array(z.string())
    .min(1, 'At least one permission is required')
    .refine(
      (permissions) => permissions.every((p) => p.includes('.')),
      'Invalid permission format. Expected format: "module.action"'
    )
    .optional(),
});