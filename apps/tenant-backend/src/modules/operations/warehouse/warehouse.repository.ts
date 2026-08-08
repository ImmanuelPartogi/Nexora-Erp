// src/modules/operations/warehouse/warehouse.repository.ts
// Tenant-safe repository for Warehouse entity
import { prisma } from '../../../shared/db/prisma';
import { NotFoundError } from '../../../shared/errors/AppError';
import { CreateWarehouseDTO, UpdateWarehouseDTO, WarehouseListQuery } from './warehouse.types';

export class WarehouseRepository {
  async findAll(companyId: string, query: WarehouseListQuery) {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { code: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.warehouse.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.warehouse.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, companyId: string) {
    return prisma.warehouse.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });
  }

  async create(data: CreateWarehouseDTO) {
    return prisma.warehouse.create({
      data,
    });
  }

  async update(id: string, companyId: string, data: UpdateWarehouseDTO) {
    const result = await prisma.warehouse.updateMany({
      where: { id, companyId, deletedAt: null },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new NotFoundError('Warehouse not found or access denied');
    }

    return (await this.findById(id, companyId))!;
  }

  async softDelete(id: string, companyId: string) {
    const result = await prisma.warehouse.updateMany({
      where: { id, companyId, deletedAt: null },
      data: {
        deletedAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new NotFoundError('Warehouse not found or access denied');
    }

    return (await prisma.warehouse.findFirst({ where: { id, companyId } }))!;
  }
}