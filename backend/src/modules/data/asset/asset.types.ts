// ============================================
// FILE: backend/src/modules/data/asset/asset.types.ts
// DTO types for Asset module
// ============================================

export interface CreateAssetDTO {
  name: string;
  code: string;
  type?: string;
  locationId?: string;
  purchaseDate?: string; // ✅ Accept string from validation
  purchasePrice?: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  description?: string;
  isActive?: boolean;
  companyId: string;
  createdBy: string;
}

export interface UpdateAssetDTO {
  name?: string;
  code?: string;
  type?: string;
  locationId?: string;
  purchaseDate?: string; // ✅ Accept string from validation
  purchasePrice?: number;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  description?: string;
  isActive?: boolean;
  updatedBy: string;
}

export interface AssetListQuery {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  locationId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}