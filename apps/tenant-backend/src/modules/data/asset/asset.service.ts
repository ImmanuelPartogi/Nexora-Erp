// ============================================
// FILE: backend/src/modules/data/asset/asset.service.ts
// Updated to enforce tenant isolation
// ============================================

import { AssetRepository } from './asset.repository';
import { NotFoundError } from '../../../shared/errors/AppError';
import { CreateAssetDTO, UpdateAssetDTO, AssetListQuery } from './asset.types';
import { codeService, CODE_ENTITIES } from '../../core/code/code.service';

export class AssetService {
  private assetRepository: AssetRepository;

  constructor() {
    this.assetRepository = new AssetRepository();
  }

  async list(companyId: string, query: AssetListQuery) {
    return this.assetRepository.findAll(companyId, query);
  }

  async getById(id: string, companyId: string) {
    const asset = await this.assetRepository.findById(id, companyId);
    
    if (!asset) {
      throw new NotFoundError('Asset not found');
    }

    return asset;
  }

  async create(data: CreateAssetDTO, companyId: string, createdBy: string) {
    const assetCode = await codeService.generateCode(companyId, CODE_ENTITIES.ASSET);

    return this.assetRepository.create({
      ...data,
      code: assetCode,
      companyId,
      createdBy,
    } as any);
  }

  async update(id: string, companyId: string, data: UpdateAssetDTO) {
    await this.getById(id, companyId);
    return this.assetRepository.update(id, companyId, data);
  }

  async delete(id: string, companyId: string) {
    await this.getById(id, companyId);
    return this.assetRepository.softDelete(id, companyId);
  }
}
