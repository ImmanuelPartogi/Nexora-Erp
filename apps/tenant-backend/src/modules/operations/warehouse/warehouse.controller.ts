// src/modules/operations/warehouse/warehouse.controller.ts
import { Request, Response, NextFunction } from 'express';
import { WarehouseService } from './warehouse.service';

export class WarehouseController {
  private warehouseService: WarehouseService;

  constructor() {
    this.warehouseService = new WarehouseService();
  }

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const companyId = req.activeCompanyId!;

      const result = await this.warehouseService.list(companyId, {
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

      const warehouse = await this.warehouseService.getById(id, companyId);

      res.json({
        success: true,
        data: warehouse,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = req.activeCompanyId!;
      const userId = req.user!.id;

      const warehouse = await this.warehouseService.create(req.body, companyId, userId);

      res.status(201).json({
        success: true,
        data: warehouse,
        message: 'Warehouse created successfully',
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

      const warehouse = await this.warehouseService.update(id, companyId, {
        ...req.body,
        updatedBy: userId,
      });

      res.json({
        success: true,
        data: warehouse,
        message: 'Warehouse updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.activeCompanyId!;

      await this.warehouseService.delete(id, companyId);

      res.json({
        success: true,
        message: 'Warehouse deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}