// src/shared/middleware/permission.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/AppError';
import { prisma } from '../db/prisma';

export const authorize = (permissionCode: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user || !req.activeCompanyId) {
        throw new ForbiddenError('Authentication required');
      }

      const hasPermission = await checkPermission(
        req.user.id,
        req.activeCompanyId,
        permissionCode
      );

      if (!hasPermission) {
        throw new ForbiddenError(
          `Permission denied: ${permissionCode}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export async function checkPermission(
  userId: string,
  companyId: string,
  permissionCode: string
): Promise<boolean> {
  // 🛡️ OWNER BYPASS: Role bernama "Owner" selalu punya akses penuh ke SEMUA
  // endpoint sesuai desain sistem ("Owner mendapat SEMUA permission di company-nya").
  // Ini jaminan defensif agar Owner tidak pernah terkunci meski ada ketidaksesuaian
  // data permission di database.
  const ownerCount = await prisma.companyUser.count({
    where: {
      userId,
      companyId,
      isActive: true,
      role: { name: 'Owner' },
    },
  });
  if (ownerCount > 0) return true;

  const count = await prisma.rolePermission.count({
    where: {
      role: {
        companyUsers: {
          some: {
            userId,
            companyId,
            isActive: true,
          },
        },
      },
      permission: {
        code: permissionCode,
      },
    },
  });

  return count > 0;
}
