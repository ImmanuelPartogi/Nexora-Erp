// src/modules/data/asset/asset.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AssetService } from './asset.service';

export class AssetController {
  private assetService: AssetService;

  constructor() {
    this.assetService = new AssetService();
  }

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const companyId = req.activeCompanyId!;

      const result = await this.assetService.list(companyId, {
        page: Number(page),
        limit: Number(limit),
        search: String(search),
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.activeCompanyId!;

      const asset = await this.assetService.getById(id, companyId);

      res.json({
        success: true,
        data: asset,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = req.activeCompanyId!;
      const userId = req.user!.id;

      const asset = await this.assetService.create(req.body, companyId, userId);

      res.status(201).json({
        success: true,
        data: asset,
        message: 'Asset created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.activeCompanyId!;
      const userId = req.user!.id;

      const asset = await this.assetService.update(id, companyId, {
        ...req.body,
        updatedBy: userId,
      });

      res.json({
        success: true,
        data: asset,
        message: 'Asset updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.activeCompanyId!;

      await this.assetService.delete(id, companyId);

      res.json({
        success: true,
        message: 'Asset deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
