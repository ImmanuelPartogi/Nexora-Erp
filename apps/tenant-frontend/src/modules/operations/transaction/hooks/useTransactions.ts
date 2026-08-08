import { useCallback } from 'react';
import { transactionApi } from '@/shared/api/transaction.api';
import { Transaction, ListQueryParams } from '@/shared/types';
import { useResource, useResourceById } from '@/shared/hooks/useResource';

type TransactionParams = ListQueryParams & { type?: string; status?: string };

export const useTransactions = (params?: TransactionParams) => {
  const fetchFn = useCallback((p?: TransactionParams) => transactionApi.list(p), []);
  return useResource<Transaction, TransactionParams>({ fetchFn, params });
};

export const useTransaction = (id: string) => {
  const fetchFn = useCallback((targetId: string) => transactionApi.getById(targetId), []);
  return useResourceById<Transaction>({ fetchFn, id });
};