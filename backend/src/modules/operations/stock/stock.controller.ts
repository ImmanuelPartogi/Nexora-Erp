// src/modules/operations/stock/stock.controller.ts
import { Request, Response, NextFunction } from 'express';
import { StockService } from './stock.service';
import { ResponseUtil } from '../../../shared/utils/response.util';
import { StockMovementRequest, StockListQuery } from './stock.types';
import { StockMovementQuery } from './stock.service';

export class StockController {
  private stockService = new StockService();

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.stockService.list(
        req.activeCompanyId!,
        req.query as unknown as StockListQuery
      );
      ResponseUtil.paginated(res, result.data, result.pagination);
    } catch (error) {
      next(error);
    }
  };

  // ✅ NEW: Get current stock untuk validasi
  getStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId, warehouseId } = req.query;

      if (!productId || !warehouseId) {
        ResponseUtil.error(res, 'productId and warehouseId are required', 400);
        return;
      }

      const result = await this.stockService.getStock(
        productId as string,
        warehouseId as string,
        req.activeCompanyId!
      );
      
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  movement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.stockService.movement(
        req.body as StockMovementRequest,
        req.activeCompanyId!,
        req.user!.id
      );
      ResponseUtil.created(res, result, 'Stock movement recorded');
    } catch (error) {
      next(error);
    }
  };

  listMovements = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.stockService.listMovements(
        req.activeCompanyId!,
        req.query as unknown as StockMovementQuery
      );
      ResponseUtil.paginated(res, result.data, result.pagination);
    } catch (error) {
      next(error);
    }
  };
}