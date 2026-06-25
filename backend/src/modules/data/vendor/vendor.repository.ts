// ============================================
// src/modules/data/vendor/vendor.repository.ts
// ============================================
import { Vendor, Prisma } from '@prisma/client';
import { prisma } from '../../../shared/db/prisma';

export class VendorRepository {
  async findAll(
    companyId: string,
    options: {
      skip: number;
      take: number;
      where?: Prisma.VendorWhereInput;
      orderBy?: Prisma.VendorOrderByWithRelationInput;
    }
  ) {
    const [data, total] = await Promise.all([
      prisma.vendor.findMany({
        where: {
          companyId,
          deletedAt: null,
          ...options.where,
        },
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
      }),
      prisma.vendor.count({
        where: {
          companyId,
          deletedAt: null,
          ...options.where,
        },
      }),
    ]);

    return { data, total };
  }

  async findById(id: string, companyId: string): Promise<Vendor | null> {
    return prisma.vendor.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });
  }

  async findByCode(code: string, companyId: string): Promise<Vendor | null> {
    return prisma.vendor.findFirst({
      where: {
        code,
        companyId,
        deletedAt: null,
      },
    });
  }

  async create(
    data: Prisma.VendorCreateInput,
    createdBy: string
  ): Promise<Vendor> {
    return prisma.vendor.create({
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
    data: Prisma.VendorUpdateInput,
    updatedBy: string
  ): Promise<Vendor> {
    return prisma.vendor.update({
      where: { id },
      data: {
        ...data,
        updatedBy,
      },
    });
  }

  async softDelete(id: string, companyId: string): Promise<Vendor> {
    return prisma.vendor.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}