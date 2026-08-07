// ============================================
// src/modules/operations/transaction/transaction.controller.ts
// ============================================
import { Request, Response, NextFunction } from 'express';
import { TransactionService } from './transaction.service';
import { ResponseUtil } from '../../../shared/utils/response.util';
import {
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionListQuery,
} from './transaction.types';

export class TransactionController {
  private transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  list = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.transactionService.list(
        req.activeCompanyId!,
        req.query as unknown as TransactionListQuery
      );
      // ✅ FIX: Use paginated() so `data` stays an array at root level.
      // `success()` would double-wrap it into { data: { data, pagination } },
      // which breaks the frontend's getPaginated() contract.
      ResponseUtil.paginated(res, result.data, result.pagination);
    } catch (error) {
      next(error);
    }
  };

  getSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { dateFrom, dateTo } = req.query;
      const result = await this.transactionService.getSummary(
        req.activeCompanyId!,
        dateFrom as string,
        dateTo as string
      );
      ResponseUtil.success(res, result);
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
      const result = await this.transactionService.getById(
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
      const result = await this.transactionService.create(
        req.body as CreateTransactionRequest,
        req.activeCompanyId!,
        req.user!.id
      );
      ResponseUtil.created(res, result, 'Transaction created successfully');
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
      const result = await this.transactionService.update(
        req.params.id,
        req.body as UpdateTransactionRequest,
        req.activeCompanyId!,
        req.user!.id
      );
      ResponseUtil.success(res, result, 'Transaction updated successfully');
    } catch (error) {
      next(error);
    }
  };

  approve = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.transactionService.approve(
        req.params.id,
        req.activeCompanyId!,
        req.user!.id
      );
      ResponseUtil.success(res, result, 'Transaction approved successfully');
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
      await this.transactionService.delete(req.params.id, req.activeCompanyId!);
      ResponseUtil.noContent(res);
    } catch (error) {
      next(error);
    }
  };
}