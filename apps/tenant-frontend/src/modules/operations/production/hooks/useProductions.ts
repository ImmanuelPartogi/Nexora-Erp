import { useCallback } from 'react';
import { productionApi } from '@/shared/api/production.api';
import { Production, ListQueryParams } from '@/shared/types';
import { useResource, useResourceById } from '@/shared/hooks/useResource';

type ProductionParams = ListQueryParams & { status?: string; productId?: string };

export const useProductions = (params?: ProductionParams) => {
  const fetchFn = useCallback((p?: ProductionParams) => productionApi.list(p), []);
  return useResource<Production, ProductionParams>({ fetchFn, params });
};

export const useProduction = (id: string) => {
  const fetchFn = useCallback((targetId: string) => productionApi.getById(targetId), []);
  return useResourceById<Production>({ fetchFn, id });
};
