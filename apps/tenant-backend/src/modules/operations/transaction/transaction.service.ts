// ============================================
// FILE: backend/src/modules/operations/transaction/transaction.service.ts
// Updated to use centralized CodeService
// ============================================

import { NotFoundError, BadRequestError } from '../../../shared/errors/AppError';
import { TransactionRepository } from './transaction.repository';
import {
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionListQuery,
} from './transaction.types';
import { codeService, CODE_ENTITIES } from '../../core/code/code.service';

export class TransactionService {
  private transactionRepo: TransactionRepository;

  constructor() {
    this.transactionRepo = new TransactionRepository();
  }

  async list(companyId: string, query: TransactionListQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.type) {
      where.type = query.type;
    }

    if (query.category) {
      where.category = { contains: query.category };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) {
        (where.date as Record<string, unknown>).gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        (where.date as Record<string, unknown>).lte = new Date(query.dateTo);
      }
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search } },
        { description: { contains: query.search } },
        { category: { contains: query.search } },
      ];
    }

    const orderBy: Record<string, string> = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'asc';
    } else {
      orderBy.date = 'desc';
    }

    const result = await this.transactionRepo.findAll(companyId, {
      skip,
      take: limit,
      where,
      orderBy,
    });

    return {
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getById(id: string, companyId: string) {
    const transaction = await this.transactionRepo.findById(id, companyId);

    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    return transaction;
  }

  async getSummary(
    companyId: string,
    dateFrom?: string,
    dateTo?: string
  ) {
    return this.transactionRepo.getSummary(
      companyId,
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined
    );
  }

  /**
   * Create transaction with centralized auto-generated code
   */
  async create(
    data: CreateTransactionRequest,
    companyId: string,
    createdBy: string
  ) {
    // Auto-generate code based on transaction type
    const entity = data.type === 'income' 
      ? CODE_ENTITIES.TRANSACTION_INCOME 
      : CODE_ENTITIES.TRANSACTION_EXPENSE;
    
    const transactionCode = await codeService.generateCode(companyId, entity);

    return this.transactionRepo.create(
      {
        ...data,
        code: transactionCode,
        company: {
          connect: { id: companyId },
        },
      } as any,
      createdBy
    );
  }

  async update(
    id: string,
    data: UpdateTransactionRequest,
    companyId: string,
    updatedBy: string
  ) {
    const transaction = await this.getById(id, companyId);

    if (transaction.status === 'approved' && data.amount) {
      throw new BadRequestError('Cannot modify amount of approved transaction');
    }

    return this.transactionRepo.update(id, data, updatedBy);
  }

  async approve(id: string, companyId: string, updatedBy: string) {
    const transaction = await this.getById(id, companyId);

    if (transaction.status === 'approved') {
      throw new BadRequestError('Transaction is already approved');
    }

    return this.transactionRepo.update(
      id,
      { status: 'approved' },
      updatedBy
    );
  }

  async delete(id: string, companyId: string) {
    const transaction = await this.getById(id, companyId);

    if (transaction.status === 'approved') {
      throw new BadRequestError('Cannot delete approved transaction');
    }

    return this.transactionRepo.softDelete(id);
  }
}
