// ============================================
// ROLE MANAGEMENT - COMPLETE
// ============================================

// FILE: src/modules/core/role/role.schema.ts
import { z } from 'zod';

export const roleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
});

export type RoleFormData = z.infer<typeof roleSchema>;