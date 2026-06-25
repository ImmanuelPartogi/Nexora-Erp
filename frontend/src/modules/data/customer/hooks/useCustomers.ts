// ============================================
// FILE: src/modules/data/customer/hooks/useCustomers.ts
// ============================================
import { useState, useEffect, useRef } from 'react';
import { customerApi } from '@/shared/api/customer.api';
import { Customer, PaginatedResponse, ListQueryParams } from '@/shared/types';

export const useCustomers = (params?: ListQueryParams) => {
  const [data, setData] = useState<PaginatedResponse<Customer> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchCustomers = async () => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);
      const response = await customerApi.list(params);
      setData(response);
    } catch (err) {
      const errorName = (err as Error)?.name;
      if (errorName !== 'AbortError') {
        setError('Failed to load customers');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const paramsKey = JSON.stringify(params);
   
    /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchCustomers();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [paramsKey]);
    /* eslint-enable react-hooks/exhaustive-deps */

  return { data, isLoading, error, refetch: fetchCustomers };
};

export const useCustomer = (id: string) => {
  const [data, setData] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

     
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await customerApi.getById(id);
        setData(response);
      } catch {
        setError('Failed to load customer');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCustomer();
    }
  }, [id]);
     

  return { data, isLoading, error };
};