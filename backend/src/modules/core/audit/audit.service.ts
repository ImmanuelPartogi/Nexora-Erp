// ============================================
// FILE 3: src/modules/core/audit/audit.service.ts
// ============================================
import { NotFoundError } from '../../../shared/errors/AppError';
import { AuditLogRepository } from './audit.repository';
import { AuditLogListQuery } from './audit.types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuditLogService {
  private auditRepo: AuditLogRepository;

  constructor() {
    this.auditRepo = new AuditLogRepository();
  }

  async list(companyId: string, query: AuditLogListQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, any> = {
      companyId,
    };

    if (query.module) {
      where.module = query.module;
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.entityType) {
      where.entityType = query.entityType;
    }

    if (query.search) {
      where.OR = [
        { module: { contains: query.search } },
        { action: { contains: query.search } },
        { entityType: { contains: query.search } },
      ];
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        (where.createdAt as any).gte = new Date(query.startDate);
      }
      if (query.endDate) {
        (where.createdAt as any).lte = new Date(query.endDate);
      }
    }

    const result = await this.auditRepo.findAll({
      skip,
      take: limit,
      where,
      orderBy: {
        createdAt: 'desc',
      },
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
    const auditLog = await this.auditRepo.findById(id);

    if (!auditLog || auditLog.companyId !== companyId) {
      throw new NotFoundError('Audit log not found');
    }

    return auditLog;
  }

  async getStats(companyId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalLogs, todayLogs, actionBreakdown] = await Promise.all([
      prisma.auditLog.count({ where: { companyId } }),
      prisma.auditLog.count({
        where: {
          companyId,
          createdAt: { gte: today },
        },
      }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where: { companyId },
        _count: { action: true },
      }),
    ]);

    return {
      totalLogs,
      todayLogs,
      actionBreakdown: actionBreakdown.map((item) => ({
        action: item.action,
        count: item._count.action,
      })),
    };
  }
}
