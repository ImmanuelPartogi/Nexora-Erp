// ============================================
// FILE: src/modules/data/employee/hooks/useEmployees.ts
// ============================================
import { useState, useEffect, useRef } from 'react';
import { employeeApi } from '@/shared/api/employee.api';
import { Employee, PaginatedResponse, ListQueryParams } from '@/shared/types';

export const useEmployees = (params?: ListQueryParams & { status?: string; department?: string }) => {
  const [data, setData] = useState<PaginatedResponse<Employee> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchEmployees = async () => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);
      const response = await employeeApi.list(params);
      setData(response);
    } catch (err) {
      const errorName = (err as Error)?.name;
      if (errorName !== 'AbortError') {
        setError('Failed to load employees');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const paramsKey = JSON.stringify(params);
   
    /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchEmployees();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [paramsKey]);
    /* eslint-enable react-hooks/exhaustive-deps */

  return { data, isLoading, error, refetch: fetchEmployees };
};

export const useEmployee = (id: string) => {
  const [data, setData] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

     
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await employeeApi.getById(id);
        setData(response);
      } catch {
        setError('Failed to load employee');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchEmployee();
    }
  }, [id]);
     

  return { data, isLoading, error };
};