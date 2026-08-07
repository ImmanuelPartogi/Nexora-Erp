// ============================================
// FILE: backend/src/modules/core/code/code.controller.ts
// Code Configuration Controller
// ============================================
import { Request, Response, NextFunction } from 'express';
import { codeService } from './code.service';
import { CreateCodeConfigRequest, UpdateCodeConfigRequest } from './code.types';
import { BadRequestError } from '../../../shared/errors/AppError';
import { ResponseUtil } from '../../../shared/utils/response.util';

export class CodeController {
  /**
   * Get all code configurations for a company
   */
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = req.activeCompanyId;
      if (!companyId) {
        throw new BadRequestError('Company ID is required');
      }

      const configs = await codeService.list(companyId);
      ResponseUtil.success(res, configs, 'Code configurations retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get code configuration by ID
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.activeCompanyId;
      if (!companyId) {
        throw new BadRequestError('Company ID is required');
      }

      const config = await codeService.getById(id, companyId);
      ResponseUtil.success(res, config, 'Code configuration retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new code configuration
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: CreateCodeConfigRequest = req.body;
      const companyId = req.activeCompanyId;
      if (!companyId) {
        throw new BadRequestError('Company ID is required');
      }

      const config = await codeService.create(companyId, data);
      ResponseUtil.created(res, config, 'Code configuration created successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update code configuration
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateCodeConfigRequest = req.body;
      const companyId = req.activeCompanyId;
      if (!companyId) {
        throw new BadRequestError('Company ID is required');
      }

      const config = await codeService.update(id, companyId, data);
      ResponseUtil.success(res, config, 'Code configuration updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete code configuration (soft delete)
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.activeCompanyId;
      if (!companyId) {
        throw new BadRequestError('Company ID is required');
      }

      await codeService.delete(id, companyId);
      ResponseUtil.noContent(res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset counter for an entity
   */
  resetCounter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.activeCompanyId;
      if (!companyId) {
        throw new BadRequestError('Company ID is required');
      }

      const config = await codeService.resetCounter(id, companyId);
      ResponseUtil.success(res, config, 'Counter reset successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generate next code for an entity
   */
  generateCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { entity } = req.body;
      const companyId = req.activeCompanyId;
      if (!companyId) {
        throw new BadRequestError('Company ID is required');
      }

      if (!entity) {
        throw new BadRequestError('Entity is required');
      }

      const code = await codeService.generateCode(companyId, entity);
      ResponseUtil.success(res, { code, entity }, 'Code generated successfully');
    } catch (error) {
      next(error);
    }
  };
}