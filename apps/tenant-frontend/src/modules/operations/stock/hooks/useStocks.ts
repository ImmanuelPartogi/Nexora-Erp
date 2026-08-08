import { useCallback } from 'react';
import { stockApi } from '@/shared/api/stock.api';
import { Stock, StockMovement, ListQueryParams } from '@/shared/types';
import { useResource } from '@/shared/hooks/useResource';

type StockParams = ListQueryParams & { warehouseId?: string; productId?: string };

export const useStocks = (params?: StockParams) => {
  const fetchFn = useCallback((p?: StockParams) => stockApi.list(p), []);
  return useResource<Stock, StockParams>({ fetchFn, params });
};

type StockMovementParams = ListQueryParams & { warehouseId?: string; productId?: string; type?: string };

export const useStockMovements = (params?: StockMovementParams) => {
  const fetchFn = useCallback((p?: StockMovementParams) => stockApi.movements(p as any), []);
  return useResource<StockMovement, StockMovementParams>({ fetchFn, params });
};