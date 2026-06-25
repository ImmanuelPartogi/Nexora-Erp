// ============================================
// FILE: backend/src/modules/data/customer/customer.service.ts
// Updated to use centralized CodeService
// ============================================

import { NotFoundError, ConflictError } from '../../../shared/errors/AppError';
import { CustomerRepository } from './customer.repository';
import {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerListQuery,
} from './customer.types';
import { codeService, CODE_ENTITIES } from '../../core/code/code.service';

export class CustomerService {
  private customerRepo: CustomerRepository;

  constructor() {
    this.customerRepo = new CustomerRepository();
  }

  async list(companyId: string, query: CustomerListQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    // Build where clause
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

    // Build order by
    const orderBy: Record<string, string> = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const result = await this.customerRepo.findAll(companyId, {
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
    const customer = await this.customerRepo.findById(id, companyId);

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    return customer;
  }

  /**
   * Create customer with centralized auto-generated code
   * Code is always auto-generated (no manual input allowed)
   */
  async create(data: CreateCustomerRequest, companyId: string, createdBy: string) {
    // Auto-generate code using centralized CodeService
    const customerCode = await codeService.generateCode(companyId, CODE_ENTITIES.CUSTOMER);

    // Create customer with auto-generated code
    // Include createdBy in the data object for the repository
    return this.customerRepo.create(
      {
        ...data,
        code: customerCode,
        company: {
          connect: { id: companyId },
        },
        createdBy, // Add createdBy to the data
      } as any,
      createdBy
    );
  }

  async update(
    id: string,
    data: UpdateCustomerRequest,
    companyId: string,
    updatedBy: string
  ) {
    const customer = await this.getById(id, companyId);

    return this.customerRepo.update(id, companyId, data, updatedBy);
  }

  async delete(id: string, companyId: string) {
    const customer = await this.getById(id, companyId);

    return this.customerRepo.softDelete(id, companyId);
  }
}
