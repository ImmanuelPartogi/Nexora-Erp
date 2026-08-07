// ============================================
// FILE: src/modules/operations/transaction/transaction.schema.ts
// ============================================
import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string().optional(),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  referenceNo: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;