// ============================================
// FILE: backend/src/modules/data/product/product.service.ts
// Updated to use centralized CodeService
// ============================================

import { NotFoundError, ConflictError } from '../../../shared/errors/AppError';
import { ProductRepository } from './product.repository';
import {
  CreateProductRequest,
  UpdateProductRequest,
  ProductListQuery,
} from './product.types';
import { codeService, CODE_ENTITIES } from '../../core/code/code.service';

export class ProductService {
  private productRepo: ProductRepository;

  constructor() {
    this.productRepo = new ProductRepository();
  }

  async list(companyId: string, query: ProductListQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { code: { contains: query.search } },
        { category: { contains: query.search } },
      ];
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.category) {
      where.category = { contains: query.category };
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

    const result = await this.productRepo.findAll(companyId, {
      skip,
      take: limit,
      where,
      orderBy,
    });

    // Transform Prisma Decimal to number
    const transformedData = result.data.map((product) => ({
      ...product,
      price: product.price ? Number(product.price) : null,
      cost: product.cost ? Number(product.cost) : null,
    }));

    return {
      data: transformedData,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getById(id: string, companyId: string) {
    const product = await this.productRepo.findById(id, companyId);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Transform Prisma Decimal to number
    return {
      ...product,
      price: product.price ? Number(product.price) : null,
      cost: product.cost ? Number(product.cost) : null,
    };
  }

  /**
   * Create product with centralized auto-generated code
   * Code is always auto-generated (no manual input allowed)
   */
  async create(data: CreateProductRequest, companyId: string, createdBy: string) {
    // Auto-generate code using centralized CodeService
    const productCode = await codeService.generateCode(companyId, CODE_ENTITIES.PRODUCT);

    const product = await this.productRepo.create(
      {
        ...data,
        code: productCode,
        company: {
          connect: { id: companyId },
        },
        createdBy,
      } as any,
      createdBy
    );

    // Transform Prisma Decimal to number
    return {
      ...product,
      price: product.price ? Number(product.price) : null,
      cost: product.cost ? Number(product.cost) : null,
    };
  }

  async update(
    id: string,
    data: UpdateProductRequest,
    companyId: string,
    updatedBy: string
  ) {
    await this.getById(id, companyId);

    const product = await this.productRepo.update(id, companyId, data, updatedBy);

    // Transform Prisma Decimal to number
    return {
      ...product,
      price: product.price ? Number(product.price) : null,
      cost: product.cost ? Number(product.cost) : null,
    };
  }

  async delete(id: string, companyId: string) {
    await this.getById(id, companyId);
    return this.productRepo.softDelete(id, companyId);
  }
}
