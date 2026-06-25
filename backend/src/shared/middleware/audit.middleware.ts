// src/shared/middleware/audit.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';

export const auditLog = (module: string, entityType: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalSend = res.send;
    let responseData: unknown;

    // Capture response data
    res.send = function (data: unknown): Response {
      responseData = data;
      res.send = originalSend;
      return res.send(data);
    } as typeof originalSend;

    // Continue to the next middleware
    res.on('finish', async () => {
      try {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const action = getActionFromMethod(req.method);
          
          if (!action) return;

          const entityId = req.params.id || extractIdFromResponse(responseData);
          
          if (!entityId) return;

          await prisma.auditLog.create({
            data: {
              id: crypto.randomUUID(),
              companyId: req.activeCompanyId!,
              userId: req.user!.id,
              createdBy: req.user!.id,
              module,
              action,
              entityType,
              entityId,
              newData: action === 'create' || action === 'update' 
                ? JSON.stringify(req.body) 
                : undefined,
              ipAddress: req.ip,
              userAgent: req.get('user-agent'),
            },
          });
        }
      } catch (error) {
        // Log error but don't fail the request
        console.error('Audit log error:', error);
      }
    });

    next();
  };
};

function getActionFromMethod(method: string): 'create' | 'update' | 'delete' | null {
  switch (method) {
    case 'POST':
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      return null;
  }
}

function extractIdFromResponse(data: unknown): string | null {
  try {
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      return parsed.data?.id || null;
    }
    return null;
  } catch {
    return null;
  }
}