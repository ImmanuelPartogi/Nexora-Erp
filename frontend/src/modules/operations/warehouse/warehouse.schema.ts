// ============================================
// WAREHOUSE MANAGEMENT - COMPLETE
// ============================================

// FILE: src/modules/operations/warehouse/warehouse.schema.ts
import { z } from 'zod';

export const warehouseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().optional(),
  location: z.string().optional(),
});

export type WarehouseFormData = z.infer<typeof warehouseSchema>;