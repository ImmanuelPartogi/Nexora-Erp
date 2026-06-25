// src/modules/operations/warehouse/warehouse.repository.ts
import { prisma } from '../../../shared/db/prisma';
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

  async update(id: string, data: UpdateWarehouseDTO) {
    return prisma.warehouse.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async softDelete(id: string) {
    return prisma.warehouse.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}