// ============================================
// FILE: frontend/src/modules/operations/lease/lease.schema.ts
// Frontend validation - SESUAI dengan Backend & Prisma
// ============================================

import { z } from 'zod';

export const leaseSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  unitName: z.string().min(1, 'Unit name is required').max(100),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  amount: z.string().min(1, 'Amount is required').or(z.number().positive('Amount must be positive')),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).default('active'),
  notes: z.string().max(1000).optional(),
});

export type LeaseFormData = z.infer<typeof leaseSchema>;

export const leaseUpdateSchema = leaseSchema.partial();
export type LeaseUpdateData = z.infer<typeof leaseUpdateSchema>;