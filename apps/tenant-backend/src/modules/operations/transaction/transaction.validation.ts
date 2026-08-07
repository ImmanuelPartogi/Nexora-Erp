// ============================================
// src/modules/operations/transaction/transaction.validation.ts
// ============================================
import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().transform((val) => new Date(val)),
  description: z.string().optional(),
});

export const updateTransactionSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  date: z.string().transform((val) => new Date(val)).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'approved']).optional(),
});

export const approveTransactionSchema = z.object({
  status: z.literal('approved'),
});