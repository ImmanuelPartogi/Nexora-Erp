// ============================================
// FILE 2: src/modules/core/audit/audit.repository.ts
// ============================================
import { prisma } from '../../../shared/db/prisma';
import { Prisma } from '@prisma/client';

export class AuditLogRepository {
  async findAll(params: {
    skip: number;
    take: number;
    where?: Prisma.AuditLogWhereInput;
    orderBy?: Prisma.AuditLogOrderByWithRelationInput;
  }) {
    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        ...params,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where: params.where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    return prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.AuditLogCreateInput) {
    return prisma.auditLog.create({
      data,
    });
  }
}