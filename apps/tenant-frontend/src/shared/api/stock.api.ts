// frontend/src/shared/api/stock.api.ts
import { apiClient } from './client';
import { Stock, StockMovement, ListQueryParams } from '../types';

export interface StockMovementRequest {
  productId: string;
  warehouseId: string;
  quantity: number;
  type: 'in' | 'out' | 'adjustment';
  referenceNo?: string;
  notes?: string;
}

export interface StockListParams extends ListQueryParams {
  warehouseId?: string;
  productId?: string;
  search?: string;
}

export interface StockMovementListParams extends ListQueryParams {
  type?: 'in' | 'out' | 'adjustment';
  warehouseId?: string;
}

// ✅ NEW: Response type untuk check stock
export interface StockCheckResponse {
  productId: string;
  warehouseId: string;
  quantity: number;
  productName: string;
  productCode?: string;
  productUnit?: string;
  warehouseName: string;
}

export const stockApi = {
  list: (params?: StockListParams) => 
    apiClient.getPaginated<Stock>('/stocks', params),

  getById: (id: string) => 
    apiClient.get<Stock>(`/stocks/${id}`),

  checkStock: (productId: string, warehouseId: string) =>
    apiClient.get<StockCheckResponse>('/stocks/check', { 
      params: { productId, warehouseId } 
    }),

  movement: (data: StockMovementRequest) => 
    apiClient.post<StockMovement>('/stocks/movement', data),

  movements: (params?: StockMovementListParams) => 
    apiClient.getPaginated<StockMovement>('/stocks/movements', params),
};