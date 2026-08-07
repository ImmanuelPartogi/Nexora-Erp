// FILE: src/modules/operations/production/hooks/useProductions.ts
import { useState, useEffect } from 'react';
import { productionApi } from '@/shared/api/production.api';
import { Production, PaginatedResponse, ListQueryParams } from '@/shared/types';

export const useProductions = (params?: ListQueryParams & { status?: string; productId?: string }) => {
  const [data, setData] = useState<PaginatedResponse<Production> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await productionApi.list(params);
      setData(response);
    } catch {
      setError('Failed to load productions');
    } finally {
      setIsLoading(false);
    }
  };

  const paramsKey = JSON.stringify(params);
  useEffect(() => {
    fetchProductions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  return { data, isLoading, error, refetch: fetchProductions };
};
