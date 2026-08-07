// ============================================
// FILE: backend/src/modules/core/code/code.validation.ts
// Code Configuration Validation
// ============================================

import { z } from 'zod';

// Entity enum for validation
const entityEnum = z.enum([
  'customer', 'vendor', 'product', 'employee', 'asset', 'warehouse',
  'stock_in', 'stock_out', 'stock_adjustment', 'production',
  'transaction_income', 'transaction_expense', 'purchase', 'lease'
]);

// CREATE SCHEMA
export const createCodeConfigSchema = z.object({
  entity: z.string().min(2, 'Entity is required').refine(
    (val) => entityEnum.safeParse(val).success,
    'Invalid entity type'
  ),
  prefix: z.string()
    .min(2, 'Prefix must be at least 2 characters long')
    .max(10, 'Prefix must not exceed 10 characters')
    .regex(/^[A-Z]+$/, 'Prefix must contain only uppercase letters'),
  digitCount: z.number()
    .min(1, 'Digit count must be at least 1')
    .max(10, 'Digit count must not exceed 10'),
});

// UPDATE SCHEMA
export const updateCodeConfigSchema = z.object({
  prefix: z.string()
    .min(2, 'Prefix must be at least 2 characters long')
    .max(10, 'Prefix must not exceed 10 characters')
    .regex(/^[A-Z]+$/, 'Prefix must contain only uppercase letters')
    .optional(),
  digitCount: z.number()
    .min(1, 'Digit count must be at least 1')
    .max(10, 'Digit count must not exceed 10')
    .optional(),
  isActive: z.boolean().optional(),
});

// QUERY SCHEMA for list endpoint
export const listCodeConfigsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().max(100).optional(),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// TypeScript types
export type CreateCodeConfigInput = z.infer<typeof createCodeConfigSchema>;
export type UpdateCodeConfigInput = z.infer<typeof updateCodeConfigSchema>;
export type ListCodeConfigsQuery = z.infer<typeof listCodeConfigsQuerySchema>;
