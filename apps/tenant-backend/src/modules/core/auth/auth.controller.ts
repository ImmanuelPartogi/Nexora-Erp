// src/modules/core/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ResponseUtil } from '../../../shared/utils/response.util';
import { LoginRequest, RegisterRequest } from './auth.types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.authService.login(req.body as LoginRequest);
      ResponseUtil.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.authService.register(req.body as RegisterRequest);
      ResponseUtil.created(res, result, 'Registration successful');
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.authService.getProfile(req.user!.id);
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
