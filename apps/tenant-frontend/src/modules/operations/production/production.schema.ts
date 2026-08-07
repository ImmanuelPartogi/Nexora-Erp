// ============================================
// PRODUCTION MODULE - COMPLETE
// ============================================

// FILE: src/modules/operations/production/production.schema.ts
import { z } from 'zod';

export const productionSchema = z.object({
  batchNo: z.string().optional(),
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

export type ProductionFormData = z.infer<typeof productionSchema>;