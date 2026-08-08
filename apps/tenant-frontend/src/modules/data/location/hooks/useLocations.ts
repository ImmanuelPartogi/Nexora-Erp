import { useCallback } from 'react';
import { locationApi } from '@/shared/api/location.api';
import { Location, ListQueryParams } from '@/shared/types';
import { useResource, useResourceById } from '@/shared/hooks/useResource';

type LocationParams = ListQueryParams & { type?: string };

export const useLocations = (params?: LocationParams) => {
  const fetchFn = useCallback((p?: LocationParams) => locationApi.list(p), []);
  return useResource<Location, LocationParams>({ fetchFn, params });
};

export const useLocation = (id: string) => {
  const fetchFn = useCallback((targetId: string) => locationApi.getById(targetId), []);
  return useResourceById<Location>({ fetchFn, id });
};