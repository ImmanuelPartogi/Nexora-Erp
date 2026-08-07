// ============================================
// FILE: backend/src/modules/core/role/role.controller.ts
// FIX: Use ResponseUtil.paginated() for list endpoint
// ============================================

import { Request, Response, NextFunction } from 'express';
import { RoleService } from './role.service';
import { ResponseUtil } from '../../../shared/utils/response.util';
import { CreateRoleRequest, UpdateRoleRequest, RoleListQuery } from './role.types';

export class RoleController {
  private roleService: RoleService;

  constructor() {
    this.roleService = new RoleService();
  }

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.roleService.list(
        req.activeCompanyId!,
        req.query as unknown as RoleListQuery
      );
      
      // ✅ FIX: Use paginated() instead of success()
      ResponseUtil.paginated(res, result.data, result.pagination);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.roleService.getById(req.params.id, req.activeCompanyId!);
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  // ✅ Get all available permissions
  getPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.roleService.getAvailablePermissions();
      ResponseUtil.success(res, result); // ✅ Ini tetap pakai success() karena bukan paginated
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.roleService.create(
        req.body as CreateRoleRequest,
        req.activeCompanyId!,
        req.user!.id
      );
      ResponseUtil.created(res, result, 'Role created successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.roleService.update(
        req.params.id,
        req.body as UpdateRoleRequest,
        req.activeCompanyId!,
        req.user!.id
      );
      ResponseUtil.success(res, result, 'Role updated successfully');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.roleService.delete(req.params.id, req.activeCompanyId!);
      ResponseUtil.noContent(res);
    } catch (error) {
      next(error);
    }
  };
}