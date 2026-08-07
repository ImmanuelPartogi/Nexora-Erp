  // src/shared/middleware/tenant.middleware.ts
  import { Request, Response, NextFunction } from 'express';
  import { BadRequestError, ForbiddenError } from '../errors/AppError';
  import { prisma } from '../db/prisma';

  export const requireCompany = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new BadRequestError('User not authenticated');
      }

      // Get active company from header or query
      const companyId = req.headers['x-company-id'] as string || req.query.companyId as string;

      if (!companyId) {
        throw new BadRequestError('Company ID required');
      }

      // Verify user has access to this company
      const companyUser = await prisma.companyUser.findFirst({
        where: {
          userId: req.user.id,
          companyId,
          isActive: true,
        },
        include: {
          company: true,
        },
      });

      if (!companyUser) {
        throw new ForbiddenError('You do not have access to this company');
      }

      if (companyUser.company.deletedAt) {
        throw new ForbiddenError('Company is deleted');
      }

      req.activeCompanyId = companyId;
      req.activeCompany = companyUser.company;
      next();
    } catch (error) {
      next(error);
    }
  };