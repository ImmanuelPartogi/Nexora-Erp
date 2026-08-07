// ============================================
// src/modules/operations/transaction/transaction.types.ts
// ============================================
export interface CreateTransactionRequest {
  type: 'income' | 'expense';
  category?: string;
  amount: number;
  date: Date;
  description?: string;
}

export interface UpdateTransactionRequest {
  type?: 'income' | 'expense';
  category?: string;
  amount?: number;
  date?: Date;
  description?: string;
  status?: 'draft' | 'approved';
}

export interface TransactionListQuery {
  page?: number;
  limit?: number;
  type?: 'income' | 'expense';
  category?: string;
  status?: 'draft' | 'approved';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}