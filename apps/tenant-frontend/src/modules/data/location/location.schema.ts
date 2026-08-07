// ============================================
// FILE: frontend/src/modules/data/location/location.schema.ts
// Frontend validation - SESUAI dengan Backend & Prisma
// ============================================

import { z } from 'zod';

export const locationSchema = z.object({
  name: z.string().min(1, 'Location name is required').max(100),
  type: z.enum(['warehouse', 'office', 'store', 'other']).optional(),
  address: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
});

export type LocationFormData = z.infer<typeof locationSchema>;

export const locationUpdateSchema = locationSchema.partial();
export type LocationUpdateData = z.infer<typeof locationUpdateSchema>;