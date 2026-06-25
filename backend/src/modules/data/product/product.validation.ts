// ============================================
// FILE: backend/src/modules/data/product/product.validation.ts
// ============================================
import { z } from 'zod';
import { paginationQuerySchema, booleanFromQueryString } from '../../../shared/utils/validation.util';

const productTypeEnum = z.enum(['goods', 'service', 'raw_material', 'finished_goods']);

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  code: z.string().max(50).optional(),
  type: productTypeEnum.optional(),
  category: z.string().max(100).optional(),
  unit: z.string().max(20).optional(),
  price: z.number().nonnegative('Price must be 0 or positive').optional(),
  cost: z.number().nonnegative('Cost must be 0 or positive').optional(),
  description: z.string().max(500).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200).optional(),
  type: productTypeEnum.optional(),
  category: z.string().max(100).optional(),
  unit: z.string().max(20).optional(),
  price: z.number().nonnegative('Price must be 0 or positive').optional(),
  cost: z.number().nonnegative('Cost must be 0 or positive').optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export const listProductQuerySchema = paginationQuerySchema.extend({
  search: z.string().max(100).optional(),
  type: productTypeEnum.optional(),
  category: z.string().max(100).optional(),
  isActive: booleanFromQueryString,
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductQuery = z.infer<typeof listProductQuerySchema>;