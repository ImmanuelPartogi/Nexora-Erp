// ============================================
// FILE: src/modules/operations/stock/hooks/useStocks.ts
// ============================================
import { useState, useEffect } from 'react';
import { stockApi, StockMovementListParams } from '@/shared/api/stock.api';
import { Stock, StockMovement, PaginatedResponse, ListQueryParams } from '@/shared/types';

export const useStocks = (params?: ListQueryParams & { warehouseId?: string; productId?: string }) => {
  const [data, setData] = useState<PaginatedResponse<Stock> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStocks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await stockApi.list(params);
      setData(response);
    } catch {
      setError('Failed to load stocks');
    } finally {
      setIsLoading(false);
    }
  };

  const paramsKey = JSON.stringify(params);
  useEffect(() => {
    fetchStocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  return { data, isLoading, error, refetch: fetchStocks };
};

export const useStockMovements = (params?: ListQueryParams & { type?: string; warehouseId?: string }) => {
  const [data, setData] = useState<PaginatedResponse<StockMovement> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await stockApi.movements(params as StockMovementListParams);
      setData(response);
    } catch {
      setError('Failed to load movements');
    } finally {
      setIsLoading(false);
    }
  };

  const paramsKey = JSON.stringify(params);
  useEffect(() => {
    fetchMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  return { data, isLoading, error, refetch: fetchMovements };
};