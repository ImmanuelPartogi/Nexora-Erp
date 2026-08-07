// ============================================
// FILE: backend/src/modules/operations/stock/stock.validation.ts
// ============================================
import { z } from 'zod';

const stockMovementTypeEnum = z.enum(['in', 'out', 'adjustment']);

// Schema wrapped with 'body' for validate() middleware
export const stockMovementSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Product ID must be valid UUID'),
    warehouseId: z.string().uuid('Warehouse ID must be valid UUID'),
    quantity: z.number().positive('Quantity must be positive number'),
    type: stockMovementTypeEnum,
    referenceNo: z.string().optional(),
    notes: z.string().optional(),
  }),
});

// Alternative: Schema without wrapper (for validateBody middleware)
export const stockMovementBodySchema = z.object({
  productId: z.string().uuid('Product ID must be valid UUID'),
  warehouseId: z.string().uuid('Warehouse ID must be valid UUID'),
  quantity: z.number().positive('Quantity must be positive number'),
  type: stockMovementTypeEnum,
  referenceNo: z.string().optional(),
  notes: z.string().optional(),
});