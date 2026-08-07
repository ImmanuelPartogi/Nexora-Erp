// ============================================
// FILE: src/modules/operations/stock/stock.schema.ts
// ✅ UNIFIED SCHEMA dengan type field
// ============================================
import { z } from 'zod';

// ✅ Base schema untuk stock movement
const stockMovementBaseSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  warehouseId: z.string().uuid('Invalid warehouse ID'),
  quantity: z.coerce
    .number()
    .positive('Quantity must be greater than 0')
    .int('Quantity must be an integer'),
  referenceNo: z.string().optional(),
  notes: z.string().optional(),
});

// ✅ Schema untuk Stock IN
export const stockInSchema = stockMovementBaseSchema.extend({
  type: z.literal('in'),
});

// ✅ Schema untuk Stock OUT
export const stockOutSchema = stockMovementBaseSchema.extend({
  type: z.literal('out'),
});

// ✅ Schema untuk Adjustment
export const stockAdjustmentSchema = stockMovementBaseSchema.extend({
  type: z.literal('adjustment'),
});

// ✅ Unified schema (untuk validasi umum)
export const stockMovementSchema = z.object({
  productId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  quantity: z.coerce.number().positive().int(),
  type: z.enum(['in', 'out', 'adjustment']),
  referenceNo: z.string().optional(),
  notes: z.string().optional(),
});

// ✅ Export types
export type StockInFormData = z.infer<typeof stockInSchema>;
export type StockOutFormData = z.infer<typeof stockOutSchema>;
export type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;
export type StockMovementFormData = z.infer<typeof stockMovementSchema>;