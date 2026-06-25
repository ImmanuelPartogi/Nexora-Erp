// ============================================
// FILE: src/modules/operations/transaction/hooks/useTransactions.ts
// ============================================
import { useState, useEffect } from 'react';
import { transactionApi } from '@/shared/api/transaction.api';
import { Transaction, PaginatedResponse, ListQueryParams } from '@/shared/types';

export const useTransactions = (params?: ListQueryParams & { type?: string; status?: string }) => {
  const [data, setData] = useState<PaginatedResponse<Transaction> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await transactionApi.list(params);
      setData(response);
    } catch {
      setError('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const paramsKey = JSON.stringify(params);
  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  return { data, isLoading, error, refetch: fetchTransactions };
};