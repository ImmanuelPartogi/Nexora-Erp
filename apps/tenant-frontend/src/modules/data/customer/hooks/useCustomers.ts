import { useCallback } from 'react';
import { customerApi } from '@/shared/api/customer.api';
import { Customer, ListQueryParams } from '@/shared/types';
import { useResource, useResourceById } from '@/shared/hooks/useResource';

export const useCustomers = (params?: ListQueryParams) => {
  const fetchFn = useCallback((p?: ListQueryParams) => customerApi.list(p), []);
  return useResource<Customer, ListQueryParams>({ fetchFn, params });
};

export const useCustomer = (id: string) => {
  const fetchFn = useCallback((targetId: string) => customerApi.getById(targetId), []);
  return useResourceById<Customer>({ fetchFn, id });
};