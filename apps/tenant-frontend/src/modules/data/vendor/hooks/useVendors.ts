import { useCallback } from 'react';
import { vendorApi } from '@/shared/api/vendor.api';
import { Vendor, ListQueryParams } from '@/shared/types';
import { useResource, useResourceById } from '@/shared/hooks/useResource';

export const useVendors = (params?: ListQueryParams) => {
  const fetchFn = useCallback((p?: ListQueryParams) => vendorApi.list(p), []);
  return useResource<Vendor, ListQueryParams>({ fetchFn, params });
};

export const useVendor = (id: string) => {
  const fetchFn = useCallback((targetId: string) => vendorApi.getById(targetId), []);
  return useResourceById<Vendor>({ fetchFn, id });
};