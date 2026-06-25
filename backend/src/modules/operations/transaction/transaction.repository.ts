// ============================================
// src/modules/operations/transaction/transaction.repository.ts
// ============================================
import { Transaction, Prisma } from '@prisma/client';
import { prisma } from '../../../shared/db/prisma';

export class TransactionRepository {
  async findAll(
    companyId: string,
    options: {
      skip: number;
      take: number;
      where?: Prisma.TransactionWhereInput;
      orderBy?: Prisma.TransactionOrderByWithRelationInput;
    }
  ) {
    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          companyId,
          deletedAt: null,
          ...options.where,
        },
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
      }),
      prisma.transaction.count({
        where: {
          companyId,
          deletedAt: null,
          ...options.where,
        },
      }),
    ]);

    return { data, total };
  }

  async findById(id: string, companyId: string): Promise<Transaction | null> {
    return prisma.transaction.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });
  }

  async create(
    data: Prisma.TransactionCreateInput,
    createdBy: string
  ): Promise<Transaction> {
    return prisma.transaction.create({
      data: {
        id: crypto.randomUUID(),
        ...data,
        createdBy,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.TransactionUpdateInput,
    updatedBy: string
  ): Promise<Transaction> {
    return prisma.transaction.update({
      where: { id },
      data: {
        ...data,
        updatedBy,
      },
    });
  }

  async softDelete(id: string): Promise<Transaction> {
    return prisma.transaction.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getSummary(companyId: string, dateFrom?: Date, dateTo?: Date) {
    const where: Prisma.TransactionWhereInput = {
      companyId,
      deletedAt: null,
      status: 'approved',
    };

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }

    const [income, expense] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          ...where,
          type: 'income',
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: {
          ...where,
          type: 'expense',
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
    ]);

    // Prisma.Decimal objects don't support arithmetic directly; convert to Number.
    const incomeTotal = income._sum.amount ? Number(income._sum.amount) : 0;
    const expenseTotal = expense._sum.amount ? Number(expense._sum.amount) : 0;

    return {
      income: {
        total: incomeTotal,
        count: income._count,
      },
      expense: {
        total: expenseTotal,
        count: expense._count,
      },
      balance: incomeTotal - expenseTotal,
    };
  }
}