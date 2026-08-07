// ============================================
// FILE: frontend/src/modules/data/asset/asset.schema.ts
// Frontend validation - SESUAI dengan Backend & Prisma
// ============================================

import { z } from 'zod';

export const assetSchema = z.object({
  name: z.string().min(1, 'Asset name is required').max(100),
  code: z.string().optional(),
  type: z.enum(['equipment', 'vehicle', 'building', 'furniture', 'other']).optional(),
  locationId: z.string().optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor', 'maintenance']).default('good'),
  purchaseDate: z.string().optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
});

export type AssetFormData = z.infer<typeof assetSchema>;

export const assetUpdateSchema = assetSchema.partial();
export type AssetUpdateData = z.infer<typeof assetUpdateSchema>;