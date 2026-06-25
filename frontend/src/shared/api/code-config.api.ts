// ============================================
// FILE: frontend/src/shared/api/code-config.api.ts
// FIX: Tambah method create() dan delete() yang sebelumnya tidak ada
// ============================================

import { apiClient } from './client';

export interface CodeConfig {
  id: string;
  entity: string;
  prefix: string;
  digitCount: number;
  lastNumber: number;
  isActive: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCodeConfigPayload {
  entity: string;
  prefix: string;
  digitCount: number;
}

export interface UpdateCodeConfigPayload {
  prefix?: string;
  digitCount?: number;
  isActive?: boolean;
}

// Label tampilan per entity (harus sama dengan CODE_ENTITIES di backend)
export const CODE_ENTITY_LABELS: Record<string, string> = {
  customer: 'Customer',
  vendor: 'Vendor',
  product: 'Product',
  employee: 'Employee',
  asset: 'Asset',
  warehouse: 'Warehouse',
  stock_in: 'Stock In',
  stock_out: 'Stock Out',
  stock_adjustment: 'Stock Adjustment',
  production: 'Production',
  transaction_income: 'Transaction Income',
  transaction_expense: 'Transaction Expense',
  purchase: 'Purchase',
  lease: 'Lease',
};

export const codeConfigApi = {
  // GET /api/v1/code-config
  list: async (): Promise<CodeConfig[]> => {
    const res = await apiClient.get<CodeConfig[]>('/code-config');
    return Array.isArray(res) ? res : [];
  },

  // GET /api/v1/code-config/:id
  getById: async (id: string): Promise<CodeConfig> => {
    const res = await apiClient.get<CodeConfig>(`/code-config/${id}`);
    return res;
  },

  // POST /api/v1/code-config
  create: async (payload: CreateCodeConfigPayload): Promise<CodeConfig> => {
    const res = await apiClient.post<CodeConfig>('/code-config', payload);
    return res;
  },

  // PUT /api/v1/code-config/:id
  update: async (id: string, payload: UpdateCodeConfigPayload): Promise<CodeConfig> => {
    const res = await apiClient.put<CodeConfig>(`/code-config/${id}`, payload);
    return res;
  },

  // DELETE /api/v1/code-config/:id
  delete: async (id: string): Promise<void> => {
    await apiClient.delete<void>(`/code-config/${id}`);
  },

  // POST /api/v1/code-config/:id/reset
  resetCounter: async (id: string): Promise<CodeConfig> => {
    const res = await apiClient.post<CodeConfig>(`/code-config/${id}/reset`);
    return res;
  },

  // POST /api/v1/code-config/generate
  generateCode: async (entity: string): Promise<{ code: string; entity: string }> => {
    const res = await apiClient.post<{ code: string; entity: string }>('/code-config/generate', { entity });
    return res;
  },
};
