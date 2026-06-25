// src/modules/operations/production/production.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ProductionService } from './production.service';
import { ResponseUtil } from '../../../shared/utils/response.util';

export class ProductionController {
  private productionService = new ProductionService();

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.productionService.list(req.activeCompanyId!);
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.productionService.create(
        req.body,
        req.activeCompanyId!,
        req.user!.id
      );
      ResponseUtil.created(res, result, 'Production created');
    } catch (error) {
      next(error);
    }
  };

  // ✅ NEW: Start production
  start = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.productionService.start(
        req.params.id,
        req.activeCompanyId!,
        req.user!.id
      );
      ResponseUtil.success(res, result, 'Production started');
    } catch (error) {
      next(error);
    }
  };

  // ✅ NEW: Complete production
  complete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.productionService.complete(
        req.params.id,
        req.activeCompanyId!,
        req.user!.id
      );
      ResponseUtil.success(res, result, 'Production completed');
    } catch (error) {
      next(error);
    }
  };

  // ✅ NEW: Cancel production
  cancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.productionService.cancel(
        req.params.id,
        req.activeCompanyId!,
        req.user!.id
      );
      ResponseUtil.success(res, result, 'Production cancelled');
    } catch (error) {
      next(error);
    }
  };
}