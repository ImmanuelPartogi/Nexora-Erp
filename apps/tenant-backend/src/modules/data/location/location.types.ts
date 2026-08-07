// src/modules/data/location/location.types.ts
export interface CreateLocationDTO {
  companyId: string;
  name: string;
  type?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  description?: string;
  createdBy: string;
}

export interface UpdateLocationDTO {
  name?: string;
  type?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  description?: string;
  updatedBy: string;
}

export interface LocationListQuery {
  page: number;
  limit: number;
  search?: string;
}