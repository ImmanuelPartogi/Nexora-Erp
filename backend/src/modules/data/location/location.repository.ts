// src/modules/data/location/location.repository.ts
import { prisma } from '../../../shared/db/prisma';
import { CreateLocationDTO, UpdateLocationDTO, LocationListQuery } from './location.types';

export class LocationRepository {
  async findAll(companyId: string, query: LocationListQuery) {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { address: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.location.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.location.count({ where }),
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
    return prisma.location.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });
  }

  async create(data: CreateLocationDTO) {
    return prisma.location.create({
      data,
    });
  }

  async update(id: string, data: UpdateLocationDTO) {
    return prisma.location.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async softDelete(id: string) {
    return prisma.location.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}