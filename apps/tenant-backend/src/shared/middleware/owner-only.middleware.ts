// ============================================
// FILE: backend/src/shared/middleware/owner-only.middleware.ts
// Restricts access to users with the "Owner" role only.
// ============================================

import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/AppError';
import { prisma } from '../db/prisma';

/**
 * Middleware factory: allows access only when the authenticated user
 * holds the "Owner" role in the active company.
 */
export const requireOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.activeCompanyId) {
      throw new ForbiddenError('Authentication and company context required');
    }

    const ownerMembership = await prisma.companyUser.findFirst({
      where: {
        userId: req.user.id,
        companyId: req.activeCompanyId,
        isActive: true,
        role: { name: 'Owner' },
      },
      select: { id: true },
    });

    if (!ownerMembership) {
      throw new ForbiddenError('Owner access required for this resource');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: checks whether a user is an Owner in a given company.
 * Reusable across services that need conditional behavior.
 */
export async function isOwner(
  userId: string,
  companyId: string
): Promise<boolean> {
  const count = await prisma.companyUser.count({
    where: {
      userId,
      companyId,
      isActive: true,
      role: { name: 'Owner' },
    },
  });
  return count > 0;
}