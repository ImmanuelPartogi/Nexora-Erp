// ============================================
// FILE: src/shared/api/transaction.api.ts
// ============================================
import { apiClient } from './client';
import { Transaction, PaginatedResponse, ListQueryParams } from '../types';

export interface CreateTransactionRequest {
  type: 'income' | 'expense';
  category?: string;
  amount: number;
  date: string;
  description?: string;
  referenceNo?: string;
}

export interface UpdateTransactionRequest {
  category?: string;
  amount?: number;
  date?: string;
  description?: string;
  status?: 'draft' | 'approved' | 'cancelled';
}

export const transactionApi = {
  list: (params?: ListQueryParams & { type?: string; status?: string }) => 
    apiClient.get<PaginatedResponse<Transaction>>('/transactions', params),

  getById: (id: string) => 
    apiClient.get<Transaction>(`/transactions/${id}`),

  create: (data: CreateTransactionRequest) => 
    apiClient.post<Transaction>('/transactions', data),

  update: (id: string, data: UpdateTransactionRequest) => 
    apiClient.put<Transaction>(`/transactions/${id}`, data),

  delete: (id: string) => 
    apiClient.delete<void>(`/transactions/${id}`),

  approve: (id: string) =>
    apiClient.post<Transaction>(`/transactions/${id}/approve`, {}),

  cancel: (id: string) =>
    apiClient.post<Transaction>(`/transactions/${id}/cancel`, {}),
};