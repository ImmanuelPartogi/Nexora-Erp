// ============================================
// src/modules/core/role/role.repository.ts
// ============================================
import { Role, Prisma } from '@prisma/client';
import { prisma } from '../../../shared/db/prisma';

export class RoleRepository {
  async findAll(
    companyId: string,
    options: {
      skip: number;
      take: number;
      where?: Prisma.RoleWhereInput;
      orderBy?: Prisma.RoleOrderByWithRelationInput;
    }
  ) {
    const [data, total] = await Promise.all([
      prisma.role.findMany({
        where: {
          companyId,
          deletedAt: null,
          ...options.where,
        },
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: {
              companyUsers: true,
            },
          },
        },
      }),
      prisma.role.count({
        where: {
          companyId,
          deletedAt: null,
          ...options.where,
        },
      }),
    ]);

    return { data, total };
  }

  async findById(id: string, companyId: string) {
    return prisma.role.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            companyUsers: true,
          },
        },
      },
    });
  }

  async findByName(name: string, companyId: string): Promise<Role | null> {
    return prisma.role.findFirst({
      where: {
        name,
        companyId,
        deletedAt: null,
      },
    });
  }

  async create(
    data: {
      name: string;
      description?: string;
      companyId: string;
    },
    permissionIds: string[]
  ) {
    return prisma.$transaction(async (tx) => {
      // Create role
      const role = await tx.role.create({
        data: {
          id: crypto.randomUUID(),
          ...data,
        },
      });

      // Assign permissions
      await tx.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          id: crypto.randomUUID(),
          roleId: role.id,
          permissionId,
        })),
      });

      return role;
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
    },
    permissionIds?: string[]
  ) {
    return prisma.$transaction(async (tx) => {
      // Update role
      const role = await tx.role.update({
        where: { id },
        data,
      });

      // Update permissions if provided
      if (permissionIds) {
        // Delete existing permissions
        await tx.rolePermission.deleteMany({
          where: { roleId: id },
        });

        // Add new permissions
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            id: crypto.randomUUID(),
            roleId: id,
            permissionId,
          })),
        });
      }

      return role;
    });
  }

  async softDelete(id: string) {
    return prisma.role.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}