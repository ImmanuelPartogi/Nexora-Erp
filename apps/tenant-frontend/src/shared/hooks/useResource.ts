import { useState, useEffect, useRef, useCallback } from 'react';
import { PaginatedResponse } from '@/shared/types';

export interface UseResourceOptions<T, P = any> {
  fetchFn: (params?: P) => Promise<PaginatedResponse<T> | any>;
  params?: P;
  enabled?: boolean;
}

export function useResource<T, P = any>({ fetchFn, params, enabled = true }: UseResourceOptions<T, P>) {
  const [data, setData] = useState<PaginatedResponse<T> | any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const paramsKey = JSON.stringify(params);

  const fetchResource = useCallback(async () => {
    if (!enabled) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchFn(params);
      setData(response);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setError(err?.message || 'Failed to load data');
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, paramsKey, enabled]);

  useEffect(() => {
    fetchResource();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchResource]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchResource,
  };
}

export interface UseResourceByIdOptions<T> {
  fetchFn: (id: string) => Promise<T>;
  id: string;
  enabled?: boolean;
}

export function useResourceById<T>({ fetchFn, id, enabled = true }: UseResourceByIdOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(id) && enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchResource = useCallback(async () => {
    if (!id || !enabled) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchFn(id);
      setData(response);
    } catch (err: any) {
      setError(err?.message || 'Failed to load item');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, id, enabled]);

  useEffect(() => {
    fetchResource();
  }, [fetchResource]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchResource,
  };
}
