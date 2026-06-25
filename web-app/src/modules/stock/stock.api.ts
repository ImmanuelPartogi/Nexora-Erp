// ============================================
// FILE: web-app/src/modules/stock/stock.api.ts
// Stock list + warehouse options.
// ============================================
import { apiClient } from '../../shared/api/client';
import type {
  PaginatedResponse,
  Stock,
  StockListQuery,
  Warehouse,
} from '../../shared/types';

export const stockApi = {
  /** GET /stocks */
  list(params?: StockListQuery): Promise<PaginatedResponse<Stock>> {
    return apiClient.getPaginated<Stock>(
      '/stocks',
      params ? { ...params } : undefined
    );
  },

  /** GET /warehouses — for the warehouse filter dropdown/sheet. */
  warehouses(): Promise<Warehouse[]> {
    return apiClient.get<Warehouse[]>('/warehouses', { limit: 100 });
  },
};