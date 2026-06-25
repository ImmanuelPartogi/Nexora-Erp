// ============================================
// FILE 1: src/modules/data/product/product.controller.ts
// FIX: Gunakan ResponseUtil.paginated() untuk list
// ============================================
import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service';
import { ResponseUtil } from '../../../shared/utils/response.util';
import {
  CreateProductRequest,
  UpdateProductRequest,
  ProductListQuery,
} from './product.types';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  list = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.productService.list(
        req.activeCompanyId!,
        req.query as unknown as ProductListQuery
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
      const result = await this.productService.getById(
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
      const result = await this.productService.create(
        req.body as CreateProductRequest,
        req.activeCompanyId!,
        req.user!.id
      );
      ResponseUtil.created(res, result, 'Product created successfully');
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
      const result = await this.productService.update(
        req.params.id,
        req.body as UpdateProductRequest,
        req.activeCompanyId!,
        req.user!.id
      );
      ResponseUtil.success(res, result, 'Product updated successfully');
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
      await this.productService.delete(req.params.id, req.activeCompanyId!);
      ResponseUtil.noContent(res);
    } catch (error) {
      next(error);
    }
  };
}