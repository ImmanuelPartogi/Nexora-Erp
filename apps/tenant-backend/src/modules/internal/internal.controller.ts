import { Request, Response, NextFunction } from 'express';
import { getPrismaClient } from '../../config/database';

export class InternalController {
  // GET /api/v1/internal/tenants
  getTenants = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prisma = getPrismaClient();
      const companies = await prisma.company.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          industryType: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: { companyUsers: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = companies.map((c) => ({
        id: c.id,
        name: c.name,
        industryType: c.industryType,
        isActive: c.isActive,
        userCount: c._count.companyUsers,
        createdAt: c.createdAt,
      }));

      res.json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/internal/stats
  getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prisma = getPrismaClient();
      const totalRequests = await prisma.requestLog.count();
      const totalErrors = await prisma.requestLog.count({
        where: { statusCode: { gte: 500 } },
      });

      const tenantStatsGroup = await prisma.requestLog.groupBy({
        by: ['tenantId'],
        _count: {
          _all: true,
        },
      });

      const tenantErrorsGroup = await prisma.requestLog.groupBy({
        by: ['tenantId'],
        where: { statusCode: { gte: 500 } },
        _count: {
          _all: true,
        },
      });

      const errorMap = new Map<string | null, number>();
      tenantErrorsGroup.forEach((g) => {
        errorMap.set(g.tenantId, g._count._all);
      });

      const tenantStats = tenantStatsGroup.map((g) => ({
        tenantId: g.tenantId || 'unassigned',
        requestCount: g._count._all,
        errorCount: errorMap.get(g.tenantId) || 0,
      }));

      res.json({
        success: true,
        data: {
          totalRequests,
          totalErrors,
          tenantStats,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/internal/analytics/api-usage
  getApiUsage = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prisma = getPrismaClient();
      const topEndpoints = await prisma.requestLog.groupBy({
        by: ['endpoint', 'method'],
        _count: { _all: true },
        _avg: { responseTimeMs: true },
        orderBy: { _count: { endpoint: 'desc' } },
        take: 10,
      });

      const formatted = topEndpoints.map((e) => ({
        endpoint: e.endpoint,
        method: e.method,
        requestCount: e._count._all,
        avgResponseTimeMs: Math.round(e._avg.responseTimeMs || 0),
      }));

      res.json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/internal/analytics/errors
  getErrors = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prisma = getPrismaClient();
      const errors = await prisma.requestLog.findMany({
        where: { statusCode: { gte: 500 } },
        select: {
          id: true,
          endpoint: true,
          method: true,
          tenantId: true,
          statusCode: true,
          responseTimeMs: true,
          timestamp: true,
        },
        orderBy: { timestamp: 'desc' },
        take: 50,
      });

      res.json({
        success: true,
        data: errors,
      });
    } catch (error) {
      next(error);
    }
  };
}

