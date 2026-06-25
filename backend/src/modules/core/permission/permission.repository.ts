// ============================================
// src/modules/core/permission/permission.repository.ts
// ============================================
import { Prisma } from '@prisma/client';
import { prisma } from '../../../shared/db/prisma';

export class PermissionRepository {
  async findAll(options: {
    skip: number;
    take: number;
    where?: Prisma.PermissionWhereInput;
    orderBy?: Prisma.PermissionOrderByWithRelationInput;
  }) {
    const [data, total] = await Promise.all([
      prisma.permission.findMany({
        where: options.where,
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
        include: {
          module: {
            select: {
              code: true,
              name: true,
              layer: true,
            },
          },
        },
      }),
      prisma.permission.count({
        where: options.where,
      }),
    ]);

    return { data, total };
  }

  async findByModule() {
    return prisma.module.findMany({
      where: {
        isActive: true,
      },
      include: {
        permissions: {
          orderBy: {
            action: 'asc',
          },
        },
      },
      orderBy: {
        layer: 'asc',
      },
    });
  }

  async findById(id: string) {
    return prisma.permission.findUnique({
      where: { id },
      include: {
        module: true,
      },
    });
  }
}