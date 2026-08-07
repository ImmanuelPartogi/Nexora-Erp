// ============================================
// src/modules/core/permission/permission.service.ts
// ============================================
import { NotFoundError } from '../../../shared/errors/AppError';
import { PermissionRepository } from './permission.repository';
import {
  PermissionListQuery,
  PermissionByModuleResponse,
} from './permission.types';

export class PermissionService {
  private permissionRepo: PermissionRepository;

  constructor() {
    this.permissionRepo = new PermissionRepository();
  }

  async list(query: PermissionListQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 100, 200);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.moduleCode) {
      where.module = {
        code: query.moduleCode,
      };
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    const result = await this.permissionRepo.findAll({
      skip,
      take: limit,
      where,
      orderBy: {
        code: 'asc',
      },
    });

    return {
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async listByModule(): Promise<PermissionByModuleResponse> {
    const modules = await this.permissionRepo.findByModule();

    const result: PermissionByModuleResponse = {};

    modules.forEach((module) => {
      result[module.code] = {
        moduleName: module.name,
        permissions: module.permissions.map((p) => ({
          id: p.id,
          code: p.code,
          action: p.action,
          description: p.description,
        })),
      };
    });

    return result;
  }

  async getById(id: string) {
    const permission = await this.permissionRepo.findById(id);

    if (!permission) {
      throw new NotFoundError('Permission not found');
    }

    return permission;
  }
}