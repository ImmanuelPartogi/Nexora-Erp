// FILE: src/modules/data/location/hooks/useLocations.ts
import { useState, useEffect } from 'react';
import { locationApi } from '@/shared/api/location.api';
import { Location, PaginatedResponse, ListQueryParams } from '@/shared/types';

export const useLocations = (params?: ListQueryParams & { type?: string }) => {
  const [data, setData] = useState<PaginatedResponse<Location> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await locationApi.list(params);
      setData(response);
    } catch {
      setError('Failed to load locations');
    } finally {
      setIsLoading(false);
    }
  };

  const paramsKey = JSON.stringify(params);
  useEffect(() => {
    fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  return { data, isLoading, error, refetch: fetchLocations };
};

export const useLocation = (id: string) => {
  const [data, setData] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await locationApi.getById(id);
        setData(response);
      } catch {
        setError('Failed to load location');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchLocation();
    }
  }, [id]);

  return { data, isLoading, error };
};