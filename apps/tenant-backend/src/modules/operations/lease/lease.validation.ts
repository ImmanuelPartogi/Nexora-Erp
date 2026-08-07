// ============================================
// FILE: backend/src/modules/operations/lease/lease.validation.ts
// ============================================
import { z } from 'zod';
import { paginationQuerySchema, dateStringSchema } from '../../../shared/utils/validation.util';

const leaseStatusEnum = z.enum(['active', 'completed', 'cancelled']);

// CREATE SCHEMA
export const createLeaseSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  unitName: z.string().min(1, 'Unit name is required').max(100),
  startDate: dateStringSchema,
  endDate: dateStringSchema,
  amount: z.coerce.number().positive('Amount must be positive'),
  status: leaseStatusEnum.default('active'),
  notes: z.string().max(1000).optional(),
});

// UPDATE SCHEMA
export const updateLeaseSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID').optional(),
  unitName: z.string().min(1).max(100).optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  amount: z.coerce.number().positive('Amount must be positive').optional(),
  status: leaseStatusEnum.optional(),
  notes: z.string().max(1000).optional(),
});

// QUERY SCHEMA for list endpoint
export const listLeaseQuerySchema = paginationQuerySchema.extend({
  search: z.string().max(100).optional(),
  customerId: z.string().uuid().optional(),
  status: leaseStatusEnum.optional(),
});

// TypeScript types
export type CreateLeaseInput = z.infer<typeof createLeaseSchema>;
export type UpdateLeaseInput = z.infer<typeof updateLeaseSchema>;
export type ListLeaseQuery = z.infer<typeof listLeaseQuerySchema>;