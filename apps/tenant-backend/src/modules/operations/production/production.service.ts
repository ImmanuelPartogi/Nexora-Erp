// ============================================
// FILE: backend/src/modules/operations/production/production.service.ts
// Updated to use centralized CodeService
// ============================================

import { prisma } from '../../../shared/db/prisma';
import { BadRequestError, NotFoundError } from '../../../shared/errors/AppError';
import { CreateProductionRequest } from './production.types';
import { codeService, CODE_ENTITIES } from '../../core/code/code.service';

export class ProductionService {
  async list(companyId: string) {
    return prisma.production.findMany({
      where: { companyId, deletedAt: null },
      include: {
        productionItems: {
          include: {
            product: { select: { id: true, name: true, unit: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Create production with centralized auto-generated code
   */
  async create(data: CreateProductionRequest, companyId: string, userId: string) {
    const productionDate = typeof data.date === 'string' 
      ? new Date(data.date) 
      : data.date;

    // Auto-generate code using centralized CodeService
    const productionCode = await codeService.generateCode(companyId, CODE_ENTITIES.PRODUCTION);

    return prisma.$transaction(async (tx) => {
      const production = await tx.production.create({
        data: {
          id: crypto.randomUUID(),
          companyId,
          code: productionCode,
          batchNo: (data.batchNo || productionCode) as any,
          date: productionDate,
          notes: data.notes,
          status: 'draft',
          createdBy: userId,
        },
      });

      const items: Array<{
        id: string;
        productionId: string;
        productId: string;
        quantity: number;
        type: 'input' | 'output';
      }> = [];

      if (data.inputs && data.inputs.length > 0) {
        data.inputs.forEach((input) => {
          items.push({
            id: crypto.randomUUID(),
            productionId: production.id,
            productId: input.productId,
            quantity: input.quantity,
            type: 'input',
          });
        });
      }

      items.push({
        id: crypto.randomUUID(),
        productionId: production.id,
        productId: data.productId,
        quantity: data.quantity,
        type: 'output',
      });

      await tx.productionItem.createMany({
        data: items,
      });

      return production;
    });
  }

  async start(id: string, companyId: string, userId: string) {
    const production = await prisma.production.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!production) {
      throw new NotFoundError('Production not found');
    }

    if (production.status !== 'draft') {
      throw new BadRequestError(
        `Cannot start production with status: ${production.status}. Only draft productions can be started.`
      );
    }

    return prisma.production.update({
      where: { id },
      data: {
        status: 'in_progress',
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });
  }

  async complete(id: string, companyId: string, userId: string) {
    const production = await prisma.production.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        productionItems: true,
      },
    });

    if (!production) {
      throw new NotFoundError('Production not found');
    }

    if (production.status !== 'in_progress') {
      throw new BadRequestError(
        `Cannot complete production with status: ${production.status}. Only in-progress productions can be completed.`
      );
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.production.update({
        where: { id },
        data: {
          status: 'completed',
          updatedBy: userId,
          updatedAt: new Date(),
        },
      });

      return updated;
    });
  }

  async cancel(id: string, companyId: string, userId: string) {
    const production = await prisma.production.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!production) {
      throw new NotFoundError('Production not found');
    }

    if (production.status === 'completed') {
      throw new BadRequestError('Cannot cancel completed production');
    }

    return prisma.production.update({
      where: { id },
      data: {
        status: 'cancelled',
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });
  }
}
