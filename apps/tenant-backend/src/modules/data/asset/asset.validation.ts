// ============================================
// FILE: backend/src/modules/data/asset/asset.validation.ts
// ============================================
import { z } from 'zod';
import { paginationQuerySchema, booleanFromQueryString, dateStringSchema } from '../../../shared/utils/validation.util';

// Asset condition enum
const assetConditionEnum = z.enum(['excellent', 'good', 'fair', 'poor']);

// CREATE SCHEMA - code is optional (auto-generated)
export const createAssetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().max(50).optional(),
  type: z.string().max(50).optional(),
  locationId: z.string().uuid('Invalid location ID').optional(),
  purchaseDate: dateStringSchema.optional(),
  purchasePrice: z.number().positive('Price must be positive').optional(),
  condition: assetConditionEnum.default('good'),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().optional().default(true),
});

// UPDATE SCHEMA
export const updateAssetSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  code: z.string().max(50).optional(),
  type: z.string().max(50).optional(),
  locationId: z.string().uuid('Invalid location ID').optional(),
  purchaseDate: dateStringSchema.optional(),
  purchasePrice: z.number().positive('Price must be positive').optional(),
  condition: assetConditionEnum.optional(),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().optional(),
});

// QUERY SCHEMA for list endpoint
export const listAssetQuerySchema = paginationQuerySchema.extend({
  search: z.string().max(100).optional(),
  type: z.string().max(50).optional(),
  condition: assetConditionEnum.optional(),
  locationId: z.string().uuid().optional(),
  isActive: booleanFromQueryString,
});

// TypeScript types
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type ListAssetQuery = z.infer<typeof listAssetQuerySchema>;