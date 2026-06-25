// ============================================
// src/modules/data/vendor/vendor.types.ts
// ============================================
export interface CreateVendorRequest {
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface UpdateVendorRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
}

export interface VendorListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}