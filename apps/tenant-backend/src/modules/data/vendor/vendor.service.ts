// ============================================
// FILE: backend/src/modules/data/vendor/vendor.service.ts
// Updated to use centralized CodeService
// ============================================

import { NotFoundError, ConflictError } from '../../../shared/errors/AppError';
import { VendorRepository } from './vendor.repository';
import {
  CreateVendorRequest,
  UpdateVendorRequest,
  VendorListQuery,
} from './vendor.types';
import { codeService, CODE_ENTITIES } from '../../core/code/code.service';

export class VendorService {
  private vendorRepo: VendorRepository;

  constructor() {
    this.vendorRepo = new VendorRepository();
  }

  async list(companyId: string, query: VendorListQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
        { phone: { contains: query.search } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const orderBy: Record<string, string> = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const result = await this.vendorRepo.findAll(companyId, {
      skip,
      take: limit,
      where,
      orderBy,
    });

    return {
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getById(id: string, companyId: string) {
    const vendor = await this.vendorRepo.findById(id, companyId);

    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }

    return vendor;
  }

  /**
   * Create vendor with centralized auto-generated code
   * Code is always auto-generated (no manual input allowed)
   */
  async create(data: CreateVendorRequest, companyId: string, createdBy: string) {
    // Auto-generate code using centralized CodeService
    const vendorCode = await codeService.generateCode(companyId, CODE_ENTITIES.VENDOR);

    // Create vendor with auto-generated code
    return this.vendorRepo.create(
      {
        ...data,
        code: vendorCode,
        company: {
          connect: { id: companyId },
        },
        createdBy,
      } as any,
      createdBy
    );
  }

  async update(
    id: string,
    data: UpdateVendorRequest,
    companyId: string,
    updatedBy: string
  ) {
    await this.getById(id, companyId);
    return this.vendorRepo.update(id, companyId, data, updatedBy);
  }

  async delete(id: string, companyId: string) {
    await this.getById(id, companyId);
    return this.vendorRepo.softDelete(id, companyId);
  }
}
