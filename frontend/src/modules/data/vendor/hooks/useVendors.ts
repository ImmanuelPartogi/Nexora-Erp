// ============================================
// FILE: frontend/src/modules/data/vendor/hooks/useVendors.ts
// ============================================
import { useState, useEffect } from 'react';
import { vendorApi } from '@/shared/api/vendor.api';
import { Vendor, PaginatedResponse, ListQueryParams } from '@/shared/types';

export const useVendors = (params?: ListQueryParams) => {
  const [data, setData] = useState<PaginatedResponse<Vendor> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await vendorApi.list(params);
      setData(response);
    } catch {
      setError('Failed to load vendors');
    } finally {
      setIsLoading(false);
    }
  };

  const paramsKey = JSON.stringify(params);
    /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchVendors();
     
  }, [paramsKey]);
    /* eslint-enable react-hooks/exhaustive-deps */

  return { data, isLoading, error, refetch: fetchVendors };
};

export const useVendor = (id?: string) => {
  const [data, setData] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendor = async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await vendorApi.getById(id);
      setData(response);
    } catch {
      setError('Failed to load vendor');
    } finally {
      setIsLoading(false);
    }
  };

    /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchVendor();
  }, [id]);
    /* eslint-enable react-hooks/exhaustive-deps */

  return { data, isLoading, error, refetch: fetchVendor };
};