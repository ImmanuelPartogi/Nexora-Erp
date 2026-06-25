// ============================================
// src/modules/core/user/user.repository.ts
// ============================================
import { User, Prisma } from '@prisma/client';
import { prisma } from '../../../shared/db/prisma';

export class UserRepository {
  async findAllByCompany(
    companyId: string,
    options: {
      skip: number;
      take: number;
      where?: Prisma.CompanyUserWhereInput;
      orderBy?: Prisma.CompanyUserOrderByWithRelationInput;
    }
  ) {
    const [data, total] = await Promise.all([
      prisma.companyUser.findMany({
        where: {
          companyId,
          isActive: true,
          company: { deletedAt: null },
          ...options.where,
        },
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              isActive: true,
              createdAt: true,
            },
          },
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.companyUser.count({
        where: {
          companyId,
          isActive: true,
          company: { deletedAt: null },
          ...options.where,
        },
      }),
    ]);

    return { data, total };
  }

  async findById(userId: string, companyId: string) {
    return prisma.companyUser.findFirst({
      where: {
        userId,
        companyId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            createdAt: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(
    data: {
      name: string;
      email: string;
      password: string;
    },
    companyId: string,
    roleId: string
  ) {
    return prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          id: crypto.randomUUID(),
          ...data,
        },
      });

      // Assign to company
      await tx.companyUser.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          companyId,
          roleId,
        },
      });

      return user;
    });
  }

  async update(
    userId: string,
    companyId: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      isActive?: boolean;
    },
    roleId?: string
  ) {
    return prisma.$transaction(async (tx) => {
      // Update user
      const user = await tx.user.update({
        where: { id: userId },
        data,
      });

      // Update role if provided
      if (roleId) {
        await tx.companyUser.updateMany({
          where: {
            userId,
            companyId,
          },
          data: {
            roleId,
          },
        });
      }

      return user;
    });
  }

  async deactivate(userId: string, companyId: string) {
    return prisma.companyUser.updateMany({
      where: {
        userId,
        companyId,
      },
      data: {
        isActive: false,
      },
    });
  }
}