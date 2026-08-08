// ============================================
// FILE: backend/src/modules/data/asset/asset.repository.ts
// Tenant-safe repository for Asset entity
// ============================================
import { prisma } from '../../../shared/db/prisma';
import { NotFoundError } from '../../../shared/errors/AppError';
import { CreateAssetDTO, UpdateAssetDTO, AssetListQuery } from './asset.types';

const parseDateString = (dateString: string | undefined): Date | undefined => {
  if (!dateString) return undefined;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return undefined;
  }
  return date;
};

export class AssetRepository {
  async findAll(companyId: string, query: AssetListQuery) {
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
      prisma.asset.findMany({
        where,
        skip,
        take: limit,
        include: {
          location: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.asset.count({ where }),
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
    return prisma.asset.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        location: true,
      },
    });
  }

  async create(data: CreateAssetDTO) {
    const prismaData = {
      ...data,
      purchaseDate: parseDateString(data.purchaseDate),
    };

    return prisma.asset.create({
      data: prismaData,
      include: {
        location: true,
      },
    });
  }

  async update(id: string, companyId: string, data: UpdateAssetDTO) {
    const prismaData = {
      ...data,
      purchaseDate: data.purchaseDate ? parseDateString(data.purchaseDate) : undefined,
      updatedAt: new Date(),
    };

    const result = await prisma.asset.updateMany({
      where: { id, companyId, deletedAt: null },
      data: prismaData,
    });

    if (result.count === 0) {
      throw new NotFoundError('Asset not found or access denied');
    }

    return (await this.findById(id, companyId))!;
  }

  async softDelete(id: string, companyId: string) {
    const result = await prisma.asset.updateMany({
      where: { id, companyId, deletedAt: null },
      data: {
        deletedAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new NotFoundError('Asset not found or access denied');
    }

    return (await prisma.asset.findFirst({ where: { id, companyId } }))!;
  }
}