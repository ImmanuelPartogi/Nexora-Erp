// ============================================
// FILE: backend/src/modules/data/employee/employee.repository.ts
// Tenant-safe repository for Employee entity
// ============================================

import { Employee, Prisma } from '@prisma/client';
import { prisma } from '../../../shared/db/prisma';
import { NotFoundError } from '../../../shared/errors/AppError';

export class EmployeeRepository {
  async findAll(
    companyId: string,
    options: {
      skip: number;
      take: number;
      where?: Prisma.EmployeeWhereInput;
      orderBy?: Prisma.EmployeeOrderByWithRelationInput;
    }
  ) {
    const [data, total] = await Promise.all([
      prisma.employee.findMany({
        where: {
          companyId,
          deletedAt: null,
          ...options.where,
        },
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              isActive: true,
              companyUsers: {
                where: { companyId },
                select: {
                  role: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
                take: 1,
              },
            },
          },
        },
      }),
      prisma.employee.count({
        where: {
          companyId,
          deletedAt: null,
          ...options.where,
        },
      }),
    ]);

    const transformedData = data.map((employee) => ({
      ...employee,
      user: employee.user
        ? {
            id: employee.user.id,
            email: employee.user.email,
            isActive: employee.user.isActive,
            role: employee.user.companyUsers[0]?.role,
          }
        : undefined,
    }));

    return { data: transformedData, total };
  }

  async findById(id: string, companyId: string) {
    const employee = await prisma.employee.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            companyUsers: {
              where: { companyId },
              select: {
                role: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!employee) return null;

    return {
      ...employee,
      user: employee.user
        ? {
            id: employee.user.id,
            email: employee.user.email,
            isActive: employee.user.isActive,
            role: employee.user.companyUsers[0]?.role,
          }
        : undefined,
    };
  }

  async findByCode(code: string, companyId: string): Promise<Employee | null> {
    return prisma.employee.findFirst({
      where: {
        code,
        companyId,
        deletedAt: null,
      },
    });
  }

  async create(
    data: {
      name: string;
      code?: string;
      email?: string;
      phone?: string;
      position?: string;
      department?: string;
      joinDate?: Date;
      salary?: any;
      userId?: string;
      company: { connect: { id: string } };
    },
    createdBy: string
  ): Promise<Employee> {
    const dataToCreate: any = {
      id: crypto.randomUUID(),
      name: data.name,
      code: data.code,
      email: data.email,
      phone: data.phone,
      position: data.position,
      department: data.department,
      joinDate: data.joinDate,
      salary: data.salary,
      company: data.company,
      createdBy,
    };

    if (data.userId) {
      dataToCreate.user = { connect: { id: data.userId } };
    }

    return prisma.employee.create({
      data: dataToCreate,
    });
  }

  async update(
    id: string,
    companyId: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      position?: string;
      department?: string;
      joinDate?: Date;
      salary?: any;
      status?: string;
      isActive?: boolean;
      userId?: string;
    },
    updatedBy: string
  ): Promise<Employee> {
    const dataToUpdate: any = {
      ...data,
      updatedBy,
    };

    if (data.userId) {
      dataToUpdate.user = { connect: { id: data.userId } };
    }

    const result = await prisma.employee.updateMany({
      where: { id, companyId, deletedAt: null },
      data: dataToUpdate,
    });

    if (result.count === 0) {
      throw new NotFoundError('Employee not found or access denied');
    }

    return (await this.findById(id, companyId)) as any;
  }

  async softDelete(id: string, companyId: string): Promise<Employee> {
    const result = await prisma.employee.updateMany({
      where: { id, companyId, deletedAt: null },
      data: {
        deletedAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new NotFoundError('Employee not found or access denied');
    }

    return (await prisma.employee.findFirst({ where: { id, companyId } }))!;
  }

  async findByEmail(email: string, companyId: string): Promise<Employee | null> {
    return prisma.employee.findFirst({
      where: {
        email,
        companyId,
        deletedAt: null,
      },
    });
  }
}
