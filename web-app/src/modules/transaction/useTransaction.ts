// ============================================
// FILE: web-app/src/modules/transaction/useTransaction.ts
// Domain hook: list (paginated), detail, approve actions.
// Wraps the API layer with loading/error state + abort safety.
// ============================================
import { useCallback, useState } from 'react';
import { transactionApi } from './transaction.api';
import type { Transaction, TransactionListQuery } from '../../shared/types';

interface UseTransactionListResult {
  data: Transaction[];
  total: number;
  loading: boolean;
  error: string | null;
  fetchList: (params?: TransactionListQuery) => Promise<void>;
}

/** Paginated list of transactions. */
export function useTransactionList(): UseTransactionListResult {
  const [data, setData] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async (params?: TransactionListQuery) => {
    setLoading(true);
    setError(null);
    try {
      const res = await transactionApi.list(params);
      setData(res.data);
      setTotal(res.pagination.total);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gagal memuat transaksi';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, total, loading, error, fetchList };
}

interface UseTransactionDetailResult {
  data: Transaction | null;
  loading: boolean;
  error: string | null;
  fetchById: (id: string) => Promise<void>;
}

/** Single transaction by id. */
export function useTransactionDetail(): UseTransactionDetailResult {
  const [data, setData] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await transactionApi.getById(id);
      setData(res);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gagal memuat detail transaksi';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchById };
}

interface UseApproveTransactionResult {
  loading: boolean;
  error: string | null;
  approve: (id: string) => Promise<Transaction | null>;
}

/** Approve a pending transaction. */
export function useApproveTransaction(): UseApproveTransactionResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approve = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await transactionApi.approve(id);
      return res;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gagal menyetujui transaksi';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, approve };
}