// src/modules/operations/warehouse/warehouse.types.ts
export interface CreateWarehouseDTO {
  companyId: string;
  name: string;
  code: string;
  locationId?: string;
  capacity?: number;
  isActive?: boolean;
  description?: string;
  createdBy: string;
}

export interface UpdateWarehouseDTO {
  name?: string;
  code?: string;
  locationId?: string;
  capacity?: number;
  isActive?: boolean;
  description?: string;
  updatedBy: string;
}

export interface WarehouseListQuery {
  page: number;
  limit: number;
  search?: string;
}