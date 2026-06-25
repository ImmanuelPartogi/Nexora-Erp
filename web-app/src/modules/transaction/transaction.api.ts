// ============================================
// FILE: web-app/src/modules/transaction/transaction.api.ts
// Transactions: list (paginated), detail, approve.
// NOTE: Backend exposes only /:id/approve (no reject endpoint).
// ============================================
import { apiClient } from '../../shared/api/client';
import type {
  PaginatedResponse,
  Transaction,
  TransactionListQuery,
} from '../../shared/types';

export const transactionApi = {
  /** GET /transactions */
  list(
    params?: TransactionListQuery
  ): Promise<PaginatedResponse<Transaction>> {
    return apiClient.getPaginated<Transaction>('/transactions', params);
  },

  /** GET /transactions/:id */
  getById(id: string): Promise<Transaction> {
    return apiClient.get<Transaction>(`/transactions/${id}`);
  },

  /** PATCH /transactions/:id/approve */
  approve(id: string): Promise<Transaction> {
    return apiClient.patch<Transaction>(`/transactions/${id}/approve`);
  },
};