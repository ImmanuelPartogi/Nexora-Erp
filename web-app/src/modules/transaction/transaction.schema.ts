// ============================================
// FILE: web-app/src/modules/transaction/transaction.schema.ts
// Zod validation schemas for the Transaction module.
// Shared by forms (react-hook-form) + manual validation.
// ============================================
import { z } from 'zod';

/** Transaction type enum (mirrors backend). */
export const transactionTypeEnum = z.enum(['INCOME', 'EXPENSE']);

/** Create transaction payload. */
export const createTransactionSchema = z.object({
  type: transactionTypeEnum,
  amount: z
    .number({ invalid_type_error: 'Jumlah harus berupa angka' })
    .positive('Jumlah harus lebih besar dari 0'),
  description: z
    .string()
    .min(3, 'Deskripsi minimal 3 karakter')
    .max(255, 'Deskripsi maksimal 255 karakter'),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  category: z.string().optional(),
  reference: z.string().optional(),
});

/** Transaction list query params. */
export const transactionListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type: transactionTypeEnum.optional(),
  status: z
    .enum(['PENDING', 'APPROVED', 'REJECTED'])
    .optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/** Inferred TS types. */
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type TransactionListQueryInput = z.infer<
  typeof transactionListQuerySchema
>;