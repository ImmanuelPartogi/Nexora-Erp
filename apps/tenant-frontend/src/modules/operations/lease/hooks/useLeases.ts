import { useCallback } from 'react';
import { leaseApi } from '@/shared/api/lease.api';
import { Lease, ListQueryParams } from '@/shared/types';
import { useResource, useResourceById } from '@/shared/hooks/useResource';

type LeaseParams = ListQueryParams & { status?: string; customerId?: string };

export const useLeases = (params?: LeaseParams) => {
  const fetchFn = useCallback((p?: LeaseParams) => leaseApi.list(p), []);
  return useResource<Lease, LeaseParams>({ fetchFn, params });
};

export const useLease = (id: string) => {
  const fetchFn = useCallback((targetId: string) => leaseApi.getById(targetId), []);
  return useResourceById<Lease>({ fetchFn, id });
};