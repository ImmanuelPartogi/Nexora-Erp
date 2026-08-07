// ============================================
// FILE: backend/src/modules/data/customer/customer.repository.ts
// FIX: Add method to find last customer for auto-generate code
// ============================================

import { Customer, Prisma } from '@prisma/client';
import { prisma } from '../../../shared/db/prisma';

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

  /**
   * ✅ NEW: Find last customer by company to generate next code
   * Used for auto-generating customer code: CUST-0001, CUST-0002, etc.
   */
  async findLastByCompany(companyId: string): Promise<Customer | null> {
    return prisma.customer.findFirst({
      where: {
        companyId,
        deletedAt: null,
        code: {
          startsWith: 'CUST-', // Only get auto-generated codes
        },
      },
      orderBy: {
        createdAt: 'desc', // Get latest created
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
    return prisma.customer.update({
      where: { id },
      data: {
        ...data,
        updatedBy,
      },
    });
  }

  async softDelete(
    id: string,
    companyId: string
  ): Promise<Customer> {
    return prisma.customer.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}