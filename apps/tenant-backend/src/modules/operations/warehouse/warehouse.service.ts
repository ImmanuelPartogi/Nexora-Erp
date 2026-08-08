// ============================================
// FILE: backend/src/modules/operations/warehouse/warehouse.service.ts
// Updated to enforce tenant isolation
// ============================================

import { WarehouseRepository } from './warehouse.repository';
import { NotFoundError } from '../../../shared/errors/AppError';
import { CreateWarehouseDTO, UpdateWarehouseDTO, WarehouseListQuery } from './warehouse.types';
import { codeService, CODE_ENTITIES } from '../../core/code/code.service';

export class WarehouseService {
  private warehouseRepository: WarehouseRepository;

  constructor() {
    this.warehouseRepository = new WarehouseRepository();
  }

  async list(companyId: string, query: WarehouseListQuery) {
    return this.warehouseRepository.findAll(companyId, query);
  }

  async getById(id: string, companyId: string) {
    const warehouse = await this.warehouseRepository.findById(id, companyId);
    
    if (!warehouse) {
      throw new NotFoundError('Warehouse not found');
    }

    return warehouse;
  }

  async create(data: CreateWarehouseDTO, companyId: string, createdBy: string) {
    const warehouseCode = await codeService.generateCode(companyId, CODE_ENTITIES.WAREHOUSE);

    return this.warehouseRepository.create({
      ...data,
      code: warehouseCode,
      companyId,
      createdBy,
    } as any);
  }

  async update(id: string, companyId: string, data: UpdateWarehouseDTO) {
    await this.getById(id, companyId);
    return this.warehouseRepository.update(id, companyId, data);
  }

  async delete(id: string, companyId: string) {
    await this.getById(id, companyId);
    return this.warehouseRepository.softDelete(id, companyId);
  }
}
