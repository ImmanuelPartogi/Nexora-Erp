// ============================================
// FILE 4: src/modules/core/audit/audit.controller.ts
// ============================================
import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from './audit.service';
import { ResponseUtil } from '../../../shared/utils/response.util';
import { AuditLogListQuery } from './audit.types';

export class AuditLogController {
  private auditService: AuditLogService;

  constructor() {
    this.auditService = new AuditLogService();
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.activeCompanyId!;
      const query = req.query as unknown as AuditLogListQuery;

      const result = await this.auditService.list(companyId, query);
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const companyId = req.activeCompanyId!;

      const result = await this.auditService.getById(id, companyId);
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.activeCompanyId!;

      const result = await this.auditService.getStats(companyId);
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}