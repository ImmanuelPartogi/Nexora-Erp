// ============================================
// FILE: backend/src/modules/operations/warehouse/warehouse.validation.ts
// Updated - code is now optional (auto-generated)
// ============================================

import { z } from 'zod';

export const createWarehouseSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    code: z.string().max(50).optional(), // Optional - auto-generated if not provided
    locationId: z.string().uuid().optional(),
    capacity: z.number().positive().optional(),
    isActive: z.boolean().default(true),
    description: z.string().optional(),
  }),
});

export const updateWarehouseSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    code: z.string().max(50).optional(),
    locationId: z.string().uuid().optional(),
    capacity: z.number().positive().optional(),
    isActive: z.boolean().optional(),
    description: z.string().optional(),
  }),
});
