// ============================================
// FILE: backend/src/shared/utils/validation.util.ts
// Shared Zod schemas to eliminate duplication across module validation files.
// ============================================
import { z } from 'zod';

/**
 * Reusable pagination query schema.
 * Query params arrive as strings from Express; coerce to integers with safe defaults.
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().max(50).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Reusable boolean-from-string transform for query params.
 */
export const booleanFromQueryString = z
  .enum(['true', 'false'])
  .transform((val) => val === 'true')
  .optional();

/**
 * Reusable ISO date (YYYY-MM-DD) string schema that transforms to a Date.
 */
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, 'Invalid date')
  .transform((val) => new Date(val));