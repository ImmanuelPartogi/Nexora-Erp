// ============================================
// FILE: backend/src/modules/data/product/product.types.ts
// FIX: Sinkronkan dengan validation schema + tambah Decimal support
// ============================================
import { Decimal } from '@prisma/client/runtime/library';

// ✅ PRODUCT TYPE ENUM (sesuai Prisma schema)
export type ProductType = 'goods' | 'service' | 'raw_material' | 'finished_goods';

// ✅ CREATE REQUEST (dari frontend ke backend)
export interface CreateProductRequest {
  name: string;
  code?: string;
  type?: ProductType;
  category?: string;
  unit?: string;
  price?: number;
  cost?: number;
  description?: string;
}

// ✅ UPDATE REQUEST (dari frontend ke backend)
export interface UpdateProductRequest {
  name?: string;
  type?: ProductType;
  category?: string;
  unit?: string;
  price?: number;
  cost?: number;
  description?: string;
  isActive?: boolean;
}

// ✅ LIST QUERY (query params untuk GET /products)
export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: ProductType;
  category?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ✅ RESPONSE (dari backend ke frontend)
export interface ProductResponse {
  id: string;
  companyId: string;
  name: string;
  code: string | null;
  type: string | null;
  category: string | null;
  unit: string | null;
  price: number | null;  // Sudah di-convert dari Decimal
  cost: number | null;   // Sudah di-convert dari Decimal
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string | null;
  deletedAt: Date | null;
}

// ✅ PAGINATION RESPONSE
export interface PaginatedProductResponse {
  data: ProductResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ✅ HELPER TYPE untuk convert Prisma Decimal ke number
export type DecimalToNumber<T> = {
  [K in keyof T]: T[K] extends Decimal | null
    ? number | null
    : T[K] extends Decimal
    ? number
    : T[K];
};