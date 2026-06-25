// ============================================
// FILE: backend/src/modules/core/role/role.service.ts
// FIX: Remove createdBy/updatedBy - field not in schema
// PROTECTION: Prevent deletion of Owner role
// ============================================

import { prisma } from '../../../shared/db/prisma';
import { NotFoundError, ConflictError } from '../../../shared/errors/AppError';
import { CreateRoleRequest, UpdateRoleRequest, RoleListQuery } from './role.types';

export class RoleService {
  async list(companyId: string, query: RoleListQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    const where: any = { companyId, deletedAt: null };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          rolePermissions: {
            include: {
              permission: {
                select: {
                  code: true,
                },
              },
            },
          },
        },
      }),
      prisma.role.count({ where }),
    ]);

    // ✅ Transform to include permission codes as string array
    const transformedData = data.map((role) => ({
      ...role,
      permissions: role.rolePermissions.map((rp) => rp.permission.code),
      rolePermissions: undefined, // Remove nested structure
    }));

    return {
      data: transformedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string, companyId: string) {
    const role = await prisma.role.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        rolePermissions: {
          include: {
            permission: {
              select: {
                id: true,
                code: true,
                module: { select: { code: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // ✅ Transform permissions
    return {
      ...role,
      permissions: role.rolePermissions.map((rp) => rp.permission.code),
      rolePermissions: undefined,
    };
  }

  // ✅ Get all available permissions grouped by module
  async getAvailablePermissions() {
  const permissions = await prisma.permission.findMany({
    include: {
      module: {
        select: { code: true, name: true },
      },
    },
    orderBy: [{ module: { code: 'asc' } }, { action: 'asc' }],
  });

  const grouped = permissions.reduce((acc, perm) => {
    const moduleCode = perm.module.code;
    
    if (!acc[moduleCode]) {
      acc[moduleCode] = {
        module: moduleCode,
        moduleName: perm.module.name,
        permissions: [],
      };
    }
    
    acc[moduleCode].permissions.push(perm.code);
    return acc;
  }, {} as Record<string, { module: string; moduleName: string; permissions: string[] }>);

  // ✅ Tidak perlu special handling — module 'code' sudah ada di DB
  // sehingga permissions-nya muncul otomatis melalui grouped[module.code]

  return Object.values(grouped);
}

  async create(data: CreateRoleRequest, companyId: string, _createdBy: string) {
    // Check duplicate name
    const existing = await prisma.role.findFirst({
      where: {
        name: data.name,
        companyId,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictError('Role name already exists');
    }

    // Validate permissions exist
    const permissions = await prisma.permission.findMany({
      where: { code: { in: data.permissions } },
    });

    if (permissions.length !== data.permissions.length) {
      throw new NotFoundError('One or more permissions not found');
    }

    // ✅ FIX: Create role WITHOUT createdBy field
    const role = await prisma.role.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        description: data.description,
        companyId,
        // ❌ REMOVED: createdBy (field tidak ada di schema)
        rolePermissions: {
          create: permissions.map((perm) => ({
            id: crypto.randomUUID(),
            permissionId: perm.id,
          })),
        },
      },
      include: {
        rolePermissions: {
          include: {
            permission: { select: { code: true } },
          },
        },
      },
    });

    return {
      ...role,
      permissions: role.rolePermissions.map((rp) => rp.permission.code),
      rolePermissions: undefined,
    };
  }

  async update(
    id: string,
    data: UpdateRoleRequest,
    companyId: string,
    _updatedBy: string
  ) {
    await this.getById(id, companyId);

    // Check duplicate name
    if (data.name) {
      const existing = await prisma.role.findFirst({
        where: {
          name: data.name,
          companyId,
          deletedAt: null,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictError('Role name already exists');
      }
    }

    // Update permissions if provided
    if (data.permissions) {
      const permissions = await prisma.permission.findMany({
        where: { code: { in: data.permissions } },
      });

      if (permissions.length !== data.permissions.length) {
        throw new NotFoundError('One or more permissions not found');
      }

      // Delete old permissions and create new ones
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });

      await prisma.rolePermission.createMany({
        data: permissions.map((perm) => ({
          id: crypto.randomUUID(),
          roleId: id,
          permissionId: perm.id,
        })),
      });
    }

    // ✅ FIX: Update role WITHOUT updatedBy field
    const role = await prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        // ❌ REMOVED: updatedBy (field tidak ada di schema)
        updatedAt: new Date(),
      },
      include: {
        rolePermissions: {
          include: {
            permission: { select: { code: true } },
          },
        },
      },
    });

    return {
      ...role,
      permissions: role.rolePermissions.map((rp) => rp.permission.code),
      rolePermissions: undefined,
    };
  }

  async delete(id: string, companyId: string) {
    const role = await this.getById(id, companyId);

    // ✅ PROTECTION: Prevent deletion of Owner role
    if (role.name.toLowerCase() === 'owner') {
      throw new ConflictError('Cannot delete Owner role. This role is required for system integrity.');
    }

    // Check if role is assigned to users
    const usersCount = await prisma.companyUser.count({
      where: { roleId: id, isActive: true },
    });

    if (usersCount > 0) {
      throw new ConflictError(`Cannot delete role. ${usersCount} user(s) are assigned to this role`);
    }

    return prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
