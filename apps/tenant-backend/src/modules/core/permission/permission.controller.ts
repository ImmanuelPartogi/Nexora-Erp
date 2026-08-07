// ============================================
// src/modules/core/permission/permission.controller.ts
// ============================================
import { Request, Response, NextFunction } from 'express';
import { PermissionService } from './permission.service';
import { ResponseUtil } from '../../../shared/utils/response.util';
import { PermissionListQuery } from './permission.types';

export class PermissionController {
  private permissionService: PermissionService;

  constructor() {
    this.permissionService = new PermissionService();
  }

  list = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.permissionService.list(
        req.query as unknown as PermissionListQuery
      );
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  listByModule = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.permissionService.listByModule();
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.permissionService.getById(req.params.id);
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}