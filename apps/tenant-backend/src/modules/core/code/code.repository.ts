// ============================================
// FILE: backend/src/modules/core/code/code.repository.ts
// Tenant-safe repository for Code Configuration entity
// ============================================

import { prisma } from '../../../shared/db/prisma';
import { NotFoundError } from '../../../shared/errors/AppError';
import { CreateCodeConfigRequest, UpdateCodeConfigRequest } from './code.types';

export class CodeRepository {
  async findAll(companyId: string) {
    return prisma.codeConfig.findMany({
      where: { companyId },
      orderBy: { entity: 'asc' },
    });
  }

  async findById(id: string, companyId: string) {
    return prisma.codeConfig.findFirst({
      where: { id, companyId },
    });
  }

  async create(data: CreateCodeConfigRequest, companyId: string) {
    return prisma.codeConfig.create({
      data: {
        id: crypto.randomUUID(),
        company: { connect: { id: companyId } },
        entity: data.entity,
        prefix: data.prefix.toUpperCase(),
        digitCount: data.digitCount,
        lastNumber: 0,
        isActive: true,
      },
    });
  }

  async update(id: string, companyId: string, data: UpdateCodeConfigRequest) {
    const result = await prisma.codeConfig.updateMany({
      where: { id, companyId },
      data: {
        ...(data.prefix && { prefix: data.prefix.toUpperCase() }),
        ...(data.digitCount && { digitCount: data.digitCount }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    if (result.count === 0) {
      throw new NotFoundError('Code configuration not found or access denied');
    }

    return (await this.findById(id, companyId))!;
  }

  async delete(id: string, companyId: string) {
    const result = await prisma.codeConfig.updateMany({
      where: { id, companyId },
      data: { isActive: false },
    });

    if (result.count === 0) {
      throw new NotFoundError('Code configuration not found or access denied');
    }

    return (await this.findById(id, companyId))!;
  }

  async resetCounter(id: string, companyId: string) {
    const result = await prisma.codeConfig.updateMany({
      where: { id, companyId },
      data: { lastNumber: 0 },
    });

    if (result.count === 0) {
      throw new NotFoundError('Code configuration not found or access denied');
    }

    return (await this.findById(id, companyId))!;
  }

  async findByEntity(entity: string, companyId: string) {
    return prisma.codeConfig.findFirst({
      where: {
        entity,
        companyId,
        isActive: true,
      },
    });
  }

  async updateLastNumber(id: string, companyId: string, lastNumber: number) {
    const result = await prisma.codeConfig.updateMany({
      where: { id, companyId },
      data: { lastNumber },
    });

    if (result.count === 0) {
      throw new NotFoundError('Code configuration not found or access denied');
    }

    return (await this.findById(id, companyId))!;
  }
}