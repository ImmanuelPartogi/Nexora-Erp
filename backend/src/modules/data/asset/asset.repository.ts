// ============================================
// FILE: backend/src/modules/data/asset/asset.repository.ts
// FIX: Convert date strings to Date objects for Prisma
// ============================================
import { prisma } from '../../../shared/db/prisma';
import { CreateAssetDTO, UpdateAssetDTO, AssetListQuery } from './asset.types';

/**
 * ✅ Helper: Convert date string (YYYY-MM-DD) to Date object
 * Prisma requires Date objects, not strings
 */
const parseDateString = (dateString: string | undefined): Date | undefined => {
  if (!dateString) return undefined;
  
  // ✅ Convert 'YYYY-MM-DD' to Date object
  // This will create a Date at midnight UTC
  const date = new Date(dateString);
  
  // ✅ Validate the date is valid
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
    // ✅ Convert date string to Date object before sending to Prisma
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

  async update(id: string, data: UpdateAssetDTO) {
    // ✅ Convert date string to Date object before sending to Prisma
    const prismaData = {
      ...data,
      purchaseDate: data.purchaseDate ? parseDateString(data.purchaseDate) : undefined,
      updatedAt: new Date(),
    };

    return prisma.asset.update({
      where: { id },
      data: prismaData,
      include: {
        location: true,
      },
    });
  }

  async softDelete(id: string) {
    return prisma.asset.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
} 