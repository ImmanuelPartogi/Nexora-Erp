// FILE: src/modules/data/asset/hooks/useAssets.ts
import { useState, useEffect } from 'react';
import { assetApi } from '@/shared/api/asset.api';
import { Asset, PaginatedResponse, ListQueryParams } from '@/shared/types';

export const useAssets = (params?: ListQueryParams & { locationId?: string; condition?: string }) => {
  const [data, setData] = useState<PaginatedResponse<Asset> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await assetApi.list(params);
      setData(response);
    } catch {
      setError('Failed to load assets');
    } finally {
      setIsLoading(false);
    }
  };

  const paramsKey = JSON.stringify(params);
  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  return { data, isLoading, error, refetch: fetchAssets };
};

export const useAsset = (id: string) => {
  const [data, setData] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await assetApi.getById(id);
        setData(response);
      } catch {
        setError('Failed to load asset');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchAsset();
    }
  }, [id]);

  return { data, isLoading, error };
};