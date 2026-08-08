import { useCallback } from 'react';
import { productApi } from '@/shared/api/product.api';
import { Product, ListQueryParams } from '@/shared/types';
import { useResource, useResourceById } from '@/shared/hooks/useResource';

type ProductParams = ListQueryParams & { type?: string };

export const useProducts = (params?: ProductParams) => {
  const fetchFn = useCallback((p?: ProductParams) => productApi.list(p), []);
  return useResource<Product, ProductParams>({ fetchFn, params });
};

export const useProduct = (id: string) => {
  const fetchFn = useCallback((targetId: string) => productApi.getById(targetId), []);
  return useResourceById<Product>({ fetchFn, id });
};