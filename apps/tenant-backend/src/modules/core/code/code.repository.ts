// ============================================
// FILE: backend/src/modules/core/code/code.repository.ts
// Code Configuration Repository
// ============================================

import { prisma } from '../../../shared/db/prisma';
import { CreateCodeConfigRequest, UpdateCodeConfigRequest, CodeConfigResponse } from './code.types';

export class CodeRepository {
  /**
   * Get all code configurations for a company
   */
  async findAll(companyId: string) {
    return prisma.codeConfig.findMany({
      where: { companyId },
      orderBy: { entity: 'asc' },
    });
  }

  /**
   * Get code configuration by ID
   */
  async findById(id: string, companyId: string) {
    return prisma.codeConfig.findFirst({
      where: { id, companyId },
    });
  }

  /**
   * Create new code configuration
   */
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

  /**
   * Update code configuration
   */
  async update(id: string, data: UpdateCodeConfigRequest) {
    return prisma.codeConfig.update({
      where: { id },
      data: {
        ...(data.prefix && { prefix: data.prefix.toUpperCase() }),
        ...(data.digitCount && { digitCount: data.digitCount }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  /**
   * Delete code configuration (soft delete)
   */
  async delete(id: string) {
    return prisma.codeConfig.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Reset counter for an entity
   */
  async resetCounter(id: string) {
    return prisma.codeConfig.update({
      where: { id },
      data: { lastNumber: 0 },
    });
  }

  /**
   * Find code configuration by entity and company
   */
  async findByEntity(entity: string, companyId: string) {
    return prisma.codeConfig.findFirst({
      where: {
        entity,
        companyId,
        isActive: true,
      },
    });
  }

  /**
   * Update last number for code generation
   */
  async updateLastNumber(id: string, lastNumber: number) {
    return prisma.codeConfig.update({
      where: { id },
      data: { lastNumber },
    });
  }
}