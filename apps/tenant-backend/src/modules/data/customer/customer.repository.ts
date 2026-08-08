// ============================================
// FILE: backend/src/modules/data/customer/customer.repository.ts
// Tenant-safe repository for Customer entity
// ============================================

import { Customer, Prisma } from '@prisma/client';
import { prisma } from '../../../shared/db/prisma';
import { NotFoundError } from '../../../shared/errors/AppError';

export class CustomerRepository {
  async findAll(
    companyId: string,
    options: {
      skip: number;
      take: number;
      where?: Prisma.CustomerWhereInput;
      orderBy?: Prisma.CustomerOrderByWithRelationInput;
    }
  ) {
    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where: {
          companyId,
          deletedAt: null,
          ...options.where,
        },
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
      }),
      prisma.customer.count({
        where: {
          companyId,
          deletedAt: null,
          ...options.where,
        },
      }),
    ]);

    return { data, total };
  }

  async findById(id: string, companyId: string): Promise<Customer | null> {
    return prisma.customer.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });
  }

  async findByCode(code: string, companyId: string): Promise<Customer | null> {
    return prisma.customer.findFirst({
      where: {
        code,
        companyId,
        deletedAt: null,
      },
    });
  }

  async findLastByCompany(companyId: string): Promise<Customer | null> {
    return prisma.customer.findFirst({
      where: {
        companyId,
        deletedAt: null,
        code: {
          startsWith: 'CUST-',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(
    data: Prisma.CustomerCreateInput,
    createdBy: string
  ): Promise<Customer> {
    return prisma.customer.create({
      data: {
        id: crypto.randomUUID(),
        ...data,
        createdBy,
      },
    });
  }

  async update(
    id: string,
    companyId: string,
    data: Prisma.CustomerUpdateInput,
    updatedBy: string
  ): Promise<Customer> {
    const result = await prisma.customer.updateMany({
      where: { id, companyId, deletedAt: null },
      data: {
        ...data,
        updatedBy,
      },
    });

    if (result.count === 0) {
      throw new NotFoundError('Customer not found or access denied');
    }

    return (await this.findById(id, companyId))!;
  }

  async softDelete(
    id: string,
    companyId: string
  ): Promise<Customer> {
    const result = await prisma.customer.updateMany({
      where: { id, companyId, deletedAt: null },
      data: {
        deletedAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new NotFoundError('Customer not found or access denied');
    }

    return (await prisma.customer.findFirst({ where: { id, companyId } }))!;
  }
}