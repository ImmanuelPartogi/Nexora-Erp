// ============================================
// src/modules/core/user/user.controller.ts
// ============================================
import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { ResponseUtil } from '../../../shared/utils/response.util';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserListQuery,
} from './user.types';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  list = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.userService.list(
        req.activeCompanyId!,
        req.query as unknown as UserListQuery
      );
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
      const result = await this.userService.getById(
        req.params.id,
        req.activeCompanyId!
      );
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.userService.create(
        req.body as CreateUserRequest,
        req.activeCompanyId!
      );
      ResponseUtil.created(res, result, 'User created successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.userService.update(
        req.params.id,
        req.body as UpdateUserRequest,
        req.activeCompanyId!
      );
      ResponseUtil.success(res, result, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deactivate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.userService.deactivate(req.params.id, req.activeCompanyId!);
      ResponseUtil.success(res, null, 'User deactivated successfully');
    } catch (error) {
      next(error);
    }
  };
}