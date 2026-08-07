// FILE: src/modules/operations/warehouse/hooks/useWarehouses.ts
import { useState, useEffect } from 'react';
import { warehouseApi } from '@/shared/api/warehouse.api';
import { Warehouse, PaginatedResponse, ListQueryParams } from '@/shared/types';

export const useWarehouses = (params?: ListQueryParams) => {
  const [data, setData] = useState<PaginatedResponse<Warehouse> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWarehouses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await warehouseApi.list(params);
      setData(response);
    } catch {
      setError('Failed to load warehouses');
    } finally {
      setIsLoading(false);
    }
  };

  const paramsKey = JSON.stringify(params);
  useEffect(() => {
    fetchWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  return { data, isLoading, error, refetch: fetchWarehouses };
};
