// ============================================
// FILE: src/modules/data/product/hooks/useProducts.ts
// ============================================
import { useState, useEffect, useRef } from 'react';
import { productApi } from '@/shared/api/product.api';
import { Product, PaginatedResponse, ListQueryParams } from '@/shared/types';

export const useProducts = (params?: ListQueryParams & { type?: string }) => {
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProducts = async () => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);
      const response = await productApi.list(params);
      setData(response);
    } catch (err) {
      const errorName = (err as Error)?.name;
      if (errorName !== 'AbortError') {
        setError('Failed to load products');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const paramsKey = JSON.stringify(params);
   
    /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchProducts();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [paramsKey]);
    /* eslint-enable react-hooks/exhaustive-deps */

  return { data, isLoading, error, refetch: fetchProducts };
};

export const useProduct = (id: string) => {
  const [data, setData] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

     
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await productApi.getById(id);
        setData(response);
      } catch {
        setError('Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);
     

  return { data, isLoading, error };
};