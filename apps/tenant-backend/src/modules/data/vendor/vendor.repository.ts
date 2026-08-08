// ============================================
// src/modules/data/vendor/vendor.repository.ts
// Tenant-safe repository for Vendor entity
// ============================================
import { Vendor, Prisma } from '@prisma/client';
import { prisma } from '../../../shared/db/prisma';
import { NotFoundError } from '../../../shared/errors/AppError';

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
    const result = await prisma.vendor.updateMany({
      where: { id, companyId, deletedAt: null },
      data: {
        ...data,
        updatedBy,
      },
    });

    if (result.count === 0) {
      throw new NotFoundError('Vendor not found or access denied');
    }

    return (await this.findById(id, companyId))!;
  }

  async softDelete(id: string, companyId: string): Promise<Vendor> {
    const result = await prisma.vendor.updateMany({
      where: { id, companyId, deletedAt: null },
      data: {
        deletedAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new NotFoundError('Vendor not found or access denied');
    }

    return (await prisma.vendor.findFirst({ where: { id, companyId } }))!;
  }
}