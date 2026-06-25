// ============================================
// FILE: src/modules/operations/production/production.validation.ts
// ✅ EXPORT SCHEMA TANPA WRAPPER untuk validateBody()
// ============================================
import { z } from 'zod';

// ✅ Schema TANPA wrapper untuk validateBody()
export const createProductionSchema = z.object({
  batchNo: z.string().optional(),
  productId: z.string().uuid('Product ID must be valid UUID'),
  quantity: z.number().positive('Quantity must be positive'),
  date: z.string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format'
    })
    .transform((val) => new Date(val)),
  notes: z.string().optional(),
  inputs: z.array(
    z.object({
      productId: z.string().uuid('Product ID must be valid UUID'),
      quantity: z.number().positive('Quantity must be positive'),
    })
  ).default([]),
});

// ✅ OPTIONAL: Schema DENGAN wrapper untuk validate()
export const createProductionSchemaWrapped = z.object({
  body: createProductionSchema
});