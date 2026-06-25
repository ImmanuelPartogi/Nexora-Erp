// ============================================
// FILE 4: src/modules/data/employee/employee.controller.ts
// FIX: Gunakan ResponseUtil.paginated() untuk list
// ============================================
import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from './employee.service';
import { ResponseUtil } from '../../../shared/utils/response.util';
import {
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  EmployeeListQuery,
} from './employee.types';

export class EmployeeController {
  private employeeService: EmployeeService;

  constructor() {
    this.employeeService = new EmployeeService();
  }

  list = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.employeeService.list(
        req.activeCompanyId!,
        req.query as unknown as EmployeeListQuery
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
      const result = await this.employeeService.getById(
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
      const result = await this.employeeService.create(
        req.body as CreateEmployeeRequest,
        req.activeCompanyId!,
        req.user!.id
      );
      ResponseUtil.created(res, result, 'Employee created successfully');
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
      const result = await this.employeeService.update(
        req.params.id,
        req.body as UpdateEmployeeRequest,
        req.activeCompanyId!,
        req.user!.id
      );
      ResponseUtil.success(res, result, 'Employee updated successfully');
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
      await this.employeeService.delete(req.params.id, req.activeCompanyId!);
      ResponseUtil.noContent(res);
    } catch (error) {
      next(error);
    }
  };
}