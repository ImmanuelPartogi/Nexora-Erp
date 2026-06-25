// ============================================
// FILE: src/modules/operations/lease/hooks/useLeases.ts
// ============================================
import { useState, useEffect } from 'react';
import { leaseApi } from '@/shared/api/lease.api';
import { Lease, PaginatedResponse, ListQueryParams } from '@/shared/types';

export const useLeases = (params?: ListQueryParams & { status?: string; customerId?: string }) => {
  const [data, setData] = useState<PaginatedResponse<Lease> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeases = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await leaseApi.list(params);
      setData(response);
    } catch {
      setError('Failed to load leases');
    } finally {
      setIsLoading(false);
    }
  };

  const paramsKey = JSON.stringify(params);
    /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchLeases();
     
  }, [paramsKey]);
    /* eslint-enable react-hooks/exhaustive-deps */

  return { data, isLoading, error, refetch: fetchLeases };
};

export const useLease = (id: string) => {
  const [data, setData] = useState<Lease | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLease = async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await leaseApi.getById(id);
      setData(response);
    } catch {
      setError('Failed to load lease');
    } finally {
      setIsLoading(false);
    }
  };

    /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchLease();
  }, [id]);
    /* eslint-enable react-hooks/exhaustive-deps */

  return { data, isLoading, error, refetch: fetchLease };
};