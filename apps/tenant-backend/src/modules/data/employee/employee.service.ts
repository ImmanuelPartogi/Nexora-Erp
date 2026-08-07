// ============================================
// FILE: backend/src/modules/data/employee/employee.service.ts
// Updated to use centralized CodeService
// ============================================

import { NotFoundError, ConflictError, BadRequestError } from '../../../shared/errors/AppError';
import { HashUtil } from '../../../shared/utils/hash.util';
import { prisma } from '../../../shared/db/prisma';
import { EmployeeRepository } from './employee.repository';
import {
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  EmployeeListQuery,
} from './employee.types';
import { codeService, CODE_ENTITIES } from '../../core/code/code.service';

export class EmployeeService {
  private employeeRepo: EmployeeRepository;

  constructor() {
    this.employeeRepo = new EmployeeRepository();
  }

  async list(companyId: string, query: EmployeeListQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
        { phone: { contains: query.search } },
        { position: { contains: query.search } },
      ];
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.department) {
      where.department = { contains: query.department };
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }
    
    if (query.hasUserAccount !== undefined) {
      where.userId = query.hasUserAccount ? { not: null } : null;
    }

    const orderBy: Record<string, string> = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const result = await this.employeeRepo.findAll(companyId, {
      skip,
      take: limit,
      where,
      orderBy,
    });

    return {
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getById(id: string, companyId: string) {
    const employee = await this.employeeRepo.findById(id, companyId);
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }
    return employee;
  }

  /**
   * Create employee with centralized auto-generated code
   */
  async create(data: CreateEmployeeRequest, companyId: string, createdBy: string) {
    // Validasi: Email unique (if provided)
    if (data.email) {
      const existingEmail = await this.employeeRepo.findByEmail(data.email, companyId);
      if (existingEmail) {
        throw new ConflictError('Email already used by another employee');
      }
    }

    // Auto-generate code using centralized CodeService
    const employeeCode = await codeService.generateCode(companyId, CODE_ENTITIES.EMPLOYEE);

    let userId: string | undefined = undefined;

    // Create User account if flag is set
    if (data.createUserAccount) {
      if (!data.email || !data.password || !data.roleId) {
        throw new BadRequestError(
          'Email, password, and role are required when creating user account'
        );
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser) {
        throw new ConflictError('Email already registered as user account');
      }

      const role = await prisma.role.findFirst({
        where: {
          id: data.roleId,
          companyId,
          deletedAt: null,
        },
      });
      if (!role) {
        throw new NotFoundError('Role not found in this company');
      }

      const hashedPassword = await HashUtil.hash(data.password);

      const newUser = await prisma.$transaction(async (tx) => {
        // data.email is guaranteed non-null here because of the validation above,
        // but TS can't narrow through the or(literal().transform()) union.
        const user = await tx.user.create({
          data: {
            id: crypto.randomUUID(),
            name: data.name,
            email: data.email!,
            password: hashedPassword,
            isActive: true,
          },
        });

        await tx.companyUser.create({
          data: {
            id: crypto.randomUUID(),
            userId: user.id,
            companyId,
            roleId: data.roleId!,
            isActive: true,
          },
        });

        return user;
      });

      userId = newUser.id;
    }

    // Create Employee with auto-generated code
    return this.employeeRepo.create(
      {
        name: data.name,
        code: employeeCode,
        email: data.email,
        phone: data.phone,
        position: data.position,
        department: data.department,
        joinDate: data.joinDate,
        salary: data.salary,
        userId: userId || undefined,
        company: {
          connect: { id: companyId },
        },
        createdBy,
      } as any,
      createdBy
    );
  }

  async update(
    id: string,
    data: UpdateEmployeeRequest,
    companyId: string,
    updatedBy: string
  ) {
    const employee = await this.getById(id, companyId);

    if (data.email && data.email !== employee.email) {
      const existingEmail = await this.employeeRepo.findByEmail(data.email, companyId);
      if (existingEmail) {
        throw new ConflictError('Email already used by another employee');
      }
    }

    if (data.updateUserAccount && employee.userId) {
      const updateUserData: Record<string, unknown> = {};

      if (data.email) {
        updateUserData.email = data.email;
      }

      if (data.password) {
        updateUserData.password = await HashUtil.hash(data.password);
      }

      if (data.userIsActive !== undefined) {
        updateUserData.isActive = data.userIsActive;
      }

      await prisma.$transaction(async (tx) => {
        if (Object.keys(updateUserData).length > 0) {
          await tx.user.update({
            where: { id: employee.userId! },
            data: updateUserData,
          });
        }

        if (data.roleId) {
          const role = await tx.role.findFirst({
            where: {
              id: data.roleId,
              companyId,
              deletedAt: null,
            },
          });
          if (!role) {
            throw new NotFoundError('Role not found in this company');
          }

          await tx.companyUser.updateMany({
            where: {
              userId: employee.userId!,
              companyId,
            },
            data: {
              roleId: data.roleId,
            },
          });
        }
      });
    }

    return this.employeeRepo.update(
      id,
      companyId,
      {
        name: data.name,
        email: data.email,
        phone: data.phone,
        position: data.position,
        department: data.department,
        joinDate: data.joinDate,
        salary: data.salary,
        status: data.status,
        isActive: data.isActive,
      },
      updatedBy
    );
  }

  async delete(id: string, companyId: string) {
    const employee = await this.getById(id, companyId);

    if (employee.userId) {
      await prisma.companyUser.updateMany({
        where: {
          userId: employee.userId,
          companyId,
        },
        data: {
          isActive: false,
        },
      });
    }

    return this.employeeRepo.softDelete(id, companyId);
  }
}
