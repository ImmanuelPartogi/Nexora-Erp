import { useCallback } from 'react';
import { assetApi } from '@/shared/api/asset.api';
import { Asset, ListQueryParams } from '@/shared/types';
import { useResource, useResourceById } from '@/shared/hooks/useResource';

type AssetParams = ListQueryParams & { locationId?: string; condition?: string };

export const useAssets = (params?: AssetParams) => {
  const fetchFn = useCallback((p?: AssetParams) => assetApi.list(p), []);
  return useResource<Asset, AssetParams>({ fetchFn, params });
};

export const useAsset = (id: string) => {
  const fetchFn = useCallback((targetId: string) => assetApi.getById(targetId), []);
  return useResourceById<Asset>({ fetchFn, id });
};