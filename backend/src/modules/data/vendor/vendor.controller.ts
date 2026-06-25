// ============================================
// FILE 3: src/modules/data/vendor/vendor.controller.ts
// FIX: Gunakan ResponseUtil.paginated() untuk list
// ============================================
import { Request, Response, NextFunction } from 'express';
import { VendorService } from './vendor.service';
import { ResponseUtil } from '../../../shared/utils/response.util';
import {
  CreateVendorRequest,
  UpdateVendorRequest,
  VendorListQuery,
} from './vendor.types';

export class VendorController {
  private vendorService: VendorService;

  constructor() {
    this.vendorService = new VendorService();
  }

  list = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.vendorService.list(
        req.activeCompanyId!,
        req.query as unknown as VendorListQuery
      );
      
      // ✅ FIX: Gunakan paginated() bukan success()
      ResponseUtil.paginated(res, result.data, result.pagination);
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
      const result = await this.vendorService.getById(
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
      const result = await this.vendorService.create(
        req.body as CreateVendorRequest,
        req.activeCompanyId!,
        req.user!.id
      );
      ResponseUtil.created(res, result, 'Vendor created successfully');
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
      const result = await this.vendorService.update(
        req.params.id,
        req.body as UpdateVendorRequest,
        req.activeCompanyId!,
        req.user!.id
      );
      ResponseUtil.success(res, result, 'Vendor updated successfully');
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.vendorService.delete(req.params.id, req.activeCompanyId!);
      ResponseUtil.noContent(res);
    } catch (error) {
      next(error);
    }
  };
}