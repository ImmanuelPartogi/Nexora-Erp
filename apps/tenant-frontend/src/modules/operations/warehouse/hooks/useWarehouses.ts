import { useCallback } from 'react';
import { warehouseApi } from '@/shared/api/warehouse.api';
import { Warehouse, ListQueryParams } from '@/shared/types';
import { useResource, useResourceById } from '@/shared/hooks/useResource';

export const useWarehouses = (params?: ListQueryParams) => {
  const fetchFn = useCallback((p?: ListQueryParams) => warehouseApi.list(p), []);
  return useResource<Warehouse, ListQueryParams>({ fetchFn, params });
};

export const useWarehouse = (id: string) => {
  const fetchFn = useCallback((targetId: string) => warehouseApi.getById(targetId), []);
  return useResourceById<Warehouse>({ fetchFn, id });
};
