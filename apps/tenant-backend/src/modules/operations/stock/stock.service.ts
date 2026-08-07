// ============================================
// FILE: backend/src/modules/operations/stock/stock.service.ts
// Updated to use centralized CodeService
// ============================================

import { prisma } from '../../../shared/db/prisma';
import { BadRequestError, NotFoundError } from '../../../shared/errors/AppError';
import { StockMovementRequest, StockListQuery } from './stock.types';
import { codeService, CODE_ENTITIES } from '../../core/code/code.service';

export interface StockMovementQuery {
  page?: string | number;
  limit?: string | number;
  type?: 'in' | 'out' | 'adjustment';
  warehouseId?: string;
  search?: string;
}

export class StockService {

  async list(companyId: string, query: StockListQuery) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      warehouse: { companyId, deletedAt: null },
    };

    if (query.warehouseId) where.warehouseId = query.warehouseId;
    if (query.productId) where.productId = query.productId;

    if (query.search) {
      where.OR = [
        { product: { name: { contains: query.search } } },
        { product: { code: { contains: query.search } } },
        { warehouse: { name: { contains: query.search } } },
      ];
    }

    const total = await prisma.stock.count({ where });

    const stocks = await prisma.stock.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, code: true, unit: true } },
        warehouse: { select: { id: true, name: true } },
      },
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });

    return {
      data: stocks.map(stock => ({
        id: stock.id,
        companyId,
        productId: stock.productId,
        productName: stock.product?.name || 'Unknown',
        productCode: stock.product?.code,
        productUnit: stock.product?.unit,
        warehouseId: stock.warehouseId,
        warehouseName: stock.warehouse?.name || 'Unknown',
        quantity: stock.quantity.toNumber(),
        updatedAt: stock.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStock(productId: string, warehouseId: string, companyId: string) {
    const stock = await prisma.stock.findFirst({
      where: {
        productId,
        warehouseId,
        warehouse: { companyId, deletedAt: null },
      },
      include: {
        product: { select: { name: true, code: true, unit: true } },
        warehouse: { select: { name: true } },
      },
    });

    if (!stock) {
      return {
        productId,
        warehouseId,
        quantity: 0,
        productName: 'Unknown',
        warehouseName: 'Unknown',
      };
    }

    return {
      productId: stock.productId,
      warehouseId: stock.warehouseId,
      quantity: stock.quantity.toNumber(),
      productName: stock.product?.name || 'Unknown',
      productCode: stock.product?.code,
      productUnit: stock.product?.unit,
      warehouseName: stock.warehouse?.name || 'Unknown',
    };
  }

  /**
   * Create stock movement with centralized auto-generated referenceNo
   */
  async movement(data: StockMovementRequest, companyId: string, userId: string) {
    const warehouse = await prisma.warehouse.findFirst({
      where: { id: data.warehouseId, companyId, deletedAt: null },
    });
    if (!warehouse) throw new NotFoundError('Warehouse not found');

    const product = await prisma.product.findFirst({
      where: { id: data.productId, companyId, deletedAt: null },
    });
    if (!product) throw new NotFoundError('Product not found');

    return prisma.$transaction(async (tx) => {
      const currentStock = await tx.stock.findUnique({
        where: {
          productId_warehouseId: {
            productId: data.productId,
            warehouseId: data.warehouseId,
          },
        },
      });

      const currentQty = currentStock?.quantity.toNumber() || 0;

      let newQty: number;
      if (data.type === 'in') {
        newQty = currentQty + data.quantity;
      } else if (data.type === 'out') {
        newQty = currentQty - data.quantity;
        if (newQty < 0) {
          throw new BadRequestError(
            `Insufficient stock. Available: ${currentQty}, Requested: ${data.quantity}`
          );
        }
      } else {
        newQty = data.quantity;
      }

      const updatedStock = await tx.stock.upsert({
        where: {
          productId_warehouseId: {
            productId: data.productId,
            warehouseId: data.warehouseId,
          },
        },
        update: { quantity: newQty },
        create: {
          id: crypto.randomUUID(),
          productId: data.productId,
          warehouseId: data.warehouseId,
          quantity: newQty,
        },
      });

      // Auto-generate referenceNo if not provided
      let referenceNo = data.referenceNo;
      if (!referenceNo) {
        // Determine entity based on movement type
        const entity = data.type === 'in' ? CODE_ENTITIES.STOCK_IN 
          : data.type === 'out' ? CODE_ENTITIES.STOCK_OUT 
          : CODE_ENTITIES.STOCK_ADJUSTMENT;
        
        referenceNo = await codeService.generateCode(companyId, entity);
      }

      await tx.stockMovement.create({
        data: {
          id: crypto.randomUUID(),
          productId: data.productId,
          warehouseId: data.warehouseId,
          type: data.type,
          quantity: data.quantity,
          referenceNo,
          notes: data.notes,
          createdBy: userId,
        },
      });

      return {
        ...updatedStock,
        quantity: updatedStock.quantity.toNumber(),
        referenceNo,
      };
    });
  }

  async listMovements(companyId: string, query: StockMovementQuery) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      warehouse: { companyId, deletedAt: null },
    };

    if (query.type) where.type = query.type;
    if (query.warehouseId) where.warehouseId = query.warehouseId;

    if (query.search) {
      where.OR = [
        { product: { name: { contains: query.search } } },
        { product: { code: { contains: query.search } } },
        { warehouse: { name: { contains: query.search } } },
        { referenceNo: { contains: query.search } },
      ];
    }

    const total = await prisma.stockMovement.count({ where });

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, code: true, unit: true } },
        warehouse: { select: { id: true, name: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: movements.map(m => ({
        id: m.id,
        productName: m.product?.name,
        warehouseName: m.warehouse?.name,
        type: m.type,
        quantity: m.quantity.toNumber(),
        referenceNo: m.referenceNo,
        notes: m.notes,
        createdAt: m.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
