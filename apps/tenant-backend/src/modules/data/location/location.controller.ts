// src/modules/data/location/location.controller.ts
import { Request, Response, NextFunction } from 'express';
import { LocationService } from './location.service';

export class LocationController {
  private locationService: LocationService;

  constructor() {
    this.locationService = new LocationService();
  }

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const companyId = req.activeCompanyId!;

      const result = await this.locationService.list(companyId, {
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

      const location = await this.locationService.getById(id, companyId);

      res.json({
        success: true,
        data: location,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = req.activeCompanyId!;
      const userId = req.user!.id;

      const location = await this.locationService.create({
        ...req.body,
        companyId,
        createdBy: userId,
      });

      res.status(201).json({
        success: true,
        data: location,
        message: 'Location created successfully',
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

      const location = await this.locationService.update(id, companyId, {
        ...req.body,
        updatedBy: userId,
      });

      res.json({
        success: true,
        data: location,
        message: 'Location updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.activeCompanyId!;

      await this.locationService.delete(id, companyId);

      res.json({
        success: true,
        message: 'Location deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}