import { Request, Response, NextFunction } from 'express';
import { getPrismaClient } from '../../config/database';

export const requestLogMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTimeMs = Date.now() - startTime;
    const endpoint = req.path || req.originalUrl;
    const method = req.method;
    const statusCode = res.statusCode;

    const tenantId = (req as any).user?.companyId || (req.headers['x-tenant-id'] as string) || null;
    const prisma = getPrismaClient();

    if (prisma && (prisma as any).requestLog) {
      (prisma as any).requestLog
        .create({
          data: {
            endpoint,
            method,
            tenantId,
            statusCode,
            responseTimeMs,
          },
        })
        .catch((error: any) => {
          if (process.env.NODE_ENV === 'development') {
            console.error('RequestLog creation failed:', error.message);
          }
        });
    }
  });

  next();
};
