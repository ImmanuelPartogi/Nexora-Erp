// src/modules/operations/lease/lease.controller.ts
import { Request, Response, NextFunction } from 'express';
import { LeaseService } from './lease.service';
import { ResponseUtil } from '../../../shared/utils/response.util';

export class LeaseController {
  private leaseService = new LeaseService();

  // ✅ FIX: Gunakan paginated response
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.leaseService.list(req.activeCompanyId!);
      
      // ✅ Wrap dengan pagination structure
      ResponseUtil.paginated(
        res,
        result, // data array
        {
          page: 1,
          limit: result.length,
          total: result.length,
          totalPages: 1,
        }
      );
    } catch (error) {
      next(error);
    }
  };

  // ✅ TAMBAH: getById endpoint
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.leaseService.getById(
        req.params.id,
        req.activeCompanyId!
      );
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.leaseService.create(
        req.body,
        req.activeCompanyId!,
        req.user!.id
      );
      ResponseUtil.created(res, result, 'Lease created');
    } catch (error) {
      next(error);
    }
  };

  complete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.leaseService.complete(
        req.params.id,
        req.activeCompanyId!,
        req.user!.id
      );
      ResponseUtil.success(res, result, 'Lease completed successfully');
    } catch (error) {
      next(error);
    }
  };

  // ✅ TAMBAH: Cancel handler
  cancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.leaseService.cancel(
        req.params.id,
        req.activeCompanyId!,
        req.user!.id
      );
      ResponseUtil.success(res, result, 'Lease cancelled successfully');
    } catch (error) {
      next(error);
    }
  };
}