// ============================================
// FILE: src/modules/data/product/product.schema.ts
// ============================================
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().optional(),
  type: z.enum(['goods', 'service', 'raw_material', 'finished_goods']),
  unit: z.string().min(1, 'Unit is required'),
  price: z.coerce.number().min(0).optional(),
  cost: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;