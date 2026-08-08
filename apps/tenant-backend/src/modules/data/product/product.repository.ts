// ============================================
// FILE: src/modules/data/product/product.repository.ts
// Tenant-safe repository for Product entity
// ============================================
import { Product, Prisma } from '@prisma/client';
import { prisma } from '../../../shared/db/prisma';
import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';

export class ProductRepository {
  async findAll(
    companyId: string,
    options: {
      skip: number;
      take: number;
      where?: Prisma.ProductWhereInput;
      orderBy?: Prisma.ProductOrderByWithRelationInput;
    }
  ) {
    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          companyId,
          deletedAt: null,
          ...options.where,
        },
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
      }),
      prisma.product.count({
        where: {
          companyId,
          deletedAt: null,
          ...options.where,
        },
      }),
    ]);

    return { data, total };
  }

  async findById(id: string, companyId: string): Promise<Product | null> {
    return prisma.product.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });
  }

  async findByCode(code: string, companyId: string): Promise<Product | null> {
    return prisma.product.findFirst({
      where: {
        code,
        companyId,
        deletedAt: null,
      },
    });
  }

  async create(
    data: Prisma.ProductCreateInput,
    createdBy: string
  ): Promise<Product> {
    try {
      return await prisma.product.create({
        data: {
          id: crypto.randomUUID(),
          ...data,
          createdBy,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictError('Product code already exists in this company');
        }
      }
      throw error;
    }
  }

  async update(
    id: string,
    companyId: string,
    data: Prisma.ProductUpdateInput,
    updatedBy: string
  ): Promise<Product> {
    try {
      const result = await prisma.product.updateMany({
        where: { id, companyId, deletedAt: null },
        data: {
          ...data,
          updatedBy,
        },
      });

      if (result.count === 0) {
        throw new NotFoundError('Product not found or access denied');
      }

      return (await this.findById(id, companyId))!;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictError('Product code already exists in this company');
        }
      }
      throw error;
    }
  }

  async softDelete(id: string, companyId: string): Promise<Product> {
    const result = await prisma.product.updateMany({
      where: { id, companyId, deletedAt: null },
      data: {
        deletedAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new NotFoundError('Product not found or access denied');
    }

    return (await prisma.product.findFirst({ where: { id, companyId } }))!;
  }
}