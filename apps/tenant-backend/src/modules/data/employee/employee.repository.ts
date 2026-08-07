// ============================================
// FILE: backend/src/modules/data/employee/employee.repository.ts
// Fixed: Properly handle user relation using connect
// ============================================

import { Employee, Prisma } from '@prisma/client';
import { prisma } from '../../../shared/db/prisma';

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
    // Build data object - use connect for user relation if userId is provided
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

    // If userId is provided, use connect to link the relation
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
    // Build data object
    const dataToUpdate: any = {
      ...data,
      updatedBy,
    };

    // If userId is provided and not empty, use connect to link the relation
    if (data.userId) {
      dataToUpdate.user = { connect: { id: data.userId } };
    }

    return prisma.employee.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async softDelete(id: string, companyId: string): Promise<Employee> {
    return prisma.employee.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
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
