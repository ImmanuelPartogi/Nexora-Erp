// ============================================
// FILE: backend/src/modules/core/code/code.service.ts
// Centralized Code Generation Service
// Fixed: Added company connect for Prisma relation
// ============================================

import { prisma } from '../../../shared/db/prisma';
import { NotFoundError, ConflictError, BadRequestError } from '../../../shared/errors/AppError';
import { CodeRepository } from './code.repository';

// Entity types that can use auto-generated codes
export const CODE_ENTITIES = {
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  PRODUCT: 'product',
  EMPLOYEE: 'employee',
  ASSET: 'asset',
  WAREHOUSE: 'warehouse',
  STOCK_IN: 'stock_in',
  STOCK_OUT: 'stock_out',
  STOCK_ADJUSTMENT: 'stock_adjustment',
  PRODUCTION: 'production',
  TRANSACTION_INCOME: 'transaction_income',
  TRANSACTION_EXPENSE: 'transaction_expense',
  PURCHASE: 'purchase',
  LEASE: 'lease',
} as const;

export type CodeEntity = typeof CODE_ENTITIES[keyof typeof CODE_ENTITIES];

// Default configurations for each entity
export const DEFAULT_CODE_CONFIGS: Record<CodeEntity, { prefix: string; digitCount: number }> = {
  [CODE_ENTITIES.CUSTOMER]: { prefix: 'CUST', digitCount: 4 },
  [CODE_ENTITIES.VENDOR]: { prefix: 'VEND', digitCount: 4 },
  [CODE_ENTITIES.PRODUCT]: { prefix: 'PRDCT', digitCount: 4 },
  [CODE_ENTITIES.EMPLOYEE]: { prefix: 'EMP', digitCount: 4 },
  [CODE_ENTITIES.ASSET]: { prefix: 'AST', digitCount: 4 },
  [CODE_ENTITIES.WAREHOUSE]: { prefix: 'WH', digitCount: 3 },
  [CODE_ENTITIES.STOCK_IN]: { prefix: 'STIN', digitCount: 5 },
  [CODE_ENTITIES.STOCK_OUT]: { prefix: 'STOUT', digitCount: 5 },
  [CODE_ENTITIES.STOCK_ADJUSTMENT]: { prefix: 'STADJ', digitCount: 5 },
  [CODE_ENTITIES.PRODUCTION]: { prefix: 'PROD', digitCount: 5 },
  [CODE_ENTITIES.TRANSACTION_INCOME]: { prefix: 'INC', digitCount: 5 },
  [CODE_ENTITIES.TRANSACTION_EXPENSE]: { prefix: 'EXP', digitCount: 5 },
  [CODE_ENTITIES.PURCHASE]: { prefix: 'PO', digitCount: 5 },
  [CODE_ENTITIES.LEASE]: { prefix: 'LSE', digitCount: 5 },
};

export interface CreateCodeConfigRequest {
  entity: string;
  prefix: string;
  digitCount: number;
}

export interface UpdateCodeConfigRequest {
  prefix?: string;
  digitCount?: number;
  isActive?: boolean;
}

export class CodeService {
  /**
   * Generate next code for an entity
   * Uses transaction to prevent race conditions
   */
  async generateCode(companyId: string, entity: CodeEntity): Promise<string> {
    // Validate companyId is provided
    if (!companyId || typeof companyId !== 'string') {
      throw new BadRequestError('Company ID is required and must be a valid string');
    }

    // Verify company exists before proceeding
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      throw new NotFoundError('Company not found');
    }

    return prisma.$transaction(async (tx) => {
      // Find existing config or create default
      let config = await tx.codeConfig.findFirst({
        where: {
          companyId,
          entity,
          isActive: true,
        },
      });

      // If no config exists, create default
      if (!config) {
        const defaultConfig = DEFAULT_CODE_CONFIGS[entity];
        if (!defaultConfig) {
          throw new BadRequestError(`No default configuration for entity: ${entity}`);
        }

        config = await tx.codeConfig.create({
          data: {
            id: crypto.randomUUID(),
            company: { connect: { id: companyId } }, // FIXED: Explicit company connect
            entity,
            prefix: defaultConfig.prefix,
            digitCount: defaultConfig.digitCount,
            lastNumber: 0,
            isActive: true,
          },
        });
      }

      // Increment and generate code
      const nextNumber = config.lastNumber + 1;
      const formattedNumber = String(nextNumber).padStart(config.digitCount, '0');
      const code = `${config.prefix}-${formattedNumber}`;

      // Update last number
      await tx.codeConfig.update({
        where: { id: config.id },
        data: { lastNumber: nextNumber },
      });

      return code;
    });
  }

  /**
   * Get all code configurations for a company
   */
  async list(companyId: string) {
    return prisma.codeConfig.findMany({
      where: { companyId },
      orderBy: { entity: 'asc' },
    });
  }

  /**
   * Get code configuration by ID
   */
  async getById(id: string, companyId: string) {
    const config = await prisma.codeConfig.findFirst({
      where: { id, companyId },
    });

    if (!config) {
      throw new NotFoundError('Code configuration not found');
    }

    return config;
  }

  /**
   * Create new code configuration
   */
  async create(companyId: string, data: CreateCodeConfigRequest) {
    // Validate companyId is provided
    if (!companyId || typeof companyId !== 'string') {
      throw new BadRequestError('Company ID is required and must be a valid string');
    }

    // Verify company exists before proceeding
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      throw new NotFoundError('Company not found');
    }

    // Check if entity already has config
    const existing = await prisma.codeConfig.findFirst({
      where: {
        companyId,
        entity: data.entity,
      },
    });

    if (existing) {
      throw new ConflictError(`Code configuration for "${data.entity}" already exists`);
    }

    // Validate digit count
    if (data.digitCount < 1 || data.digitCount > 10) {
      throw new BadRequestError('Digit count must be between 1 and 10');
    }

    // Validate prefix format
    if (!/^[A-Z]+$/.test(data.prefix)) {
      throw new BadRequestError('Prefix must contain only uppercase letters');
    }

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
  async update(id: string, companyId: string, data: UpdateCodeConfigRequest) {
    const config = await this.getById(id, companyId);

    // Validate digit count if provided
    if (data.digitCount !== undefined) {
      if (data.digitCount < 1 || data.digitCount > 10) {
        throw new BadRequestError('Digit count must be between 1 and 10');
      }
    }

    // Validate prefix format if provided
    if (data.prefix !== undefined) {
      if (!/^[A-Z]+$/.test(data.prefix)) {
        throw new BadRequestError('Prefix must contain only uppercase letters');
      }
    }

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
  async delete(id: string, companyId: string) {
    const config = await this.getById(id, companyId);

    return prisma.codeConfig.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Reset counter for an entity
   */
  async resetCounter(id: string, companyId: string) {
    const config = await this.getById(id, companyId);

    return prisma.codeConfig.update({
      where: { id },
      data: { lastNumber: 0 },
    });
  }

  /**
   * Initialize default code configurations for a company
   * Called when a new company is created
   */
  async initializeDefaults(companyId: string) {
    const entities = Object.keys(CODE_ENTITIES);
    
    for (const entity of entities) {
      const config = DEFAULT_CODE_CONFIGS[entity as CodeEntity];
      if (!config) continue;

      await prisma.codeConfig.upsert({
        where: {
          companyId_entity: {
            companyId,
            entity,
          },
        },
        create: {
          id: crypto.randomUUID(),
          company: { connect: { id: companyId } },
          entity,
          prefix: config.prefix,
          digitCount: config.digitCount,
          lastNumber: 0,
          isActive: true,
        },
        update: {},
      });
    }
  }
}

// Singleton instance
export const codeService = new CodeService();
