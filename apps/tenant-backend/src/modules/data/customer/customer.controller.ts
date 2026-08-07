// ============================================
// FILE 2: src/modules/data/customer/customer.controller.ts
// FIX: Gunakan ResponseUtil.paginated() untuk list
// ============================================
import { Request, Response, NextFunction } from 'express';
import { CustomerService } from './customer.service';
import { ResponseUtil } from '../../../shared/utils/response.util';
import {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerListQuery,
} from './customer.types';

export class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  list = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.customerService.list(
        req.activeCompanyId!,
        req.query as unknown as CustomerListQuery
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
      const result = await this.customerService.getById(
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
      const result = await this.customerService.create(
        req.body as CreateCustomerRequest,
        req.activeCompanyId!,
        req.user!.id
      );
      ResponseUtil.created(res, result, 'Customer created successfully');
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
      const result = await this.customerService.update(
        req.params.id,
        req.body as UpdateCustomerRequest,
        req.activeCompanyId!,
        req.user!.id
      );
      ResponseUtil.success(res, result, 'Customer updated successfully');
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
      await this.customerService.delete(req.params.id, req.activeCompanyId!);
      ResponseUtil.noContent(res);
    } catch (error) {
      next(error);
    }
  };
}