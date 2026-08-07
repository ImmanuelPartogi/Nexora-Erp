// src/modules/core/auth/auth.service.ts
import { UnauthorizedError, ConflictError, BadRequestError, ForbiddenError } from '../../../shared/errors/AppError';
import { HashUtil } from '../../../shared/utils/hash.util';
import { JwtUtil } from '../../../shared/utils/jwt.util';
import { AuthRepository } from './auth.repository';
import { LoginRequest, LoginResponse, RegisterRequest } from './auth.types';
import { prisma } from '../../../shared/db/prisma';
import type { Prisma } from '@prisma/client';

export class AuthService {
  private authRepo: AuthRepository;

  constructor() {
    this.authRepo = new AuthRepository();
  }

  // ✅ HELPER: Get user permissions untuk company tertentu
  private async getUserPermissions(userId: string, companyId: string): Promise<string[]> {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        role: {
          companyUsers: {
            some: {
              userId,
              companyId,
              isActive: true,
            },
          },
        },
      },
      include: {
        permission: {
          select: {
            code: true,
          },
        },
      },
    });

    return rolePermissions.map((rp) => rp.permission.code);
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const user = await this.authRepo.findUserByEmail(data.email);

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }

    const isPasswordValid = await HashUtil.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Get user companies
    const userCompanies = await this.authRepo.getUserCompanies(user.id);

    if (userCompanies.length === 0) {
      throw new UnauthorizedError('No company access found');
    }

    // Generate token
    const token = JwtUtil.sign({
      userId: user.id,
      email: user.email,
    });

    // ✅ TAMBAHAN: Get permissions untuk first company (akan di-set sebagai active)
    const firstCompanyId = userCompanies[0].company.id;
    const permissions = await this.getUserPermissions(user.id, firstCompanyId);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      companies: userCompanies.map((cu) => ({
        id: cu.company.id,
        name: cu.company.name,
        role: cu.role.name,
      })),
      permissions, // ✅ TAMBAHAN: Kirim permissions ke frontend
    };
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    // Check if email exists
    const existingUser = await this.authRepo.findUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const hashedPassword = await HashUtil.hash(data.password);

    // Create user, company, and assign owner role in transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create user
      const user = await tx.user.create({
        data: {
          id: crypto.randomUUID(),
          name: data.name,
          email: data.email,
          password: hashedPassword,
        },
      });

      // Create company
      const company = await tx.company.create({
        data: {
          id: crypto.randomUUID(),
          name: data.companyName,
          createdBy: user.id,
        },
      });

      // Create Owner role
      const ownerRole = await tx.role.create({
        data: {
          id: crypto.randomUUID(),
          name: 'Owner',
          companyId: company.id,
          isDefault: true,
          description: 'Full system access',
        },
      });

      // ✅ Assign ALL permissions to Owner
      const allPermissions = await tx.permission.findMany();

      await tx.rolePermission.createMany({
        data: allPermissions.map((p) => ({
          id: crypto.randomUUID(),
          roleId: ownerRole.id,
          permissionId: p.id,
        })),
      });

      // Assign user to company as Owner
      await tx.companyUser.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          companyId: company.id,
          roleId: ownerRole.id,
        },
      });

      // Activate all modules for company
      const allModules = await tx.module.findMany({ where: { isActive: true } });

      await tx.companyModule.createMany({
        data: allModules.map((m) => ({
          id: crypto.randomUUID(),
          companyId: company.id,
          moduleId: m.id,
        })),
      });

      return { user, company, role: ownerRole };
    });

    // Generate token
    const token = JwtUtil.sign({
      userId: result.user.id,
      email: result.user.email,
    });

    // ✅ TAMBAHAN: Get permissions untuk new owner
    const permissions = await this.getUserPermissions(result.user.id, result.company.id);

    return {
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
      companies: [
        {
          id: result.company.id,
          name: result.company.name,
          role: result.role.name,
        },
      ],
      permissions, // ✅ TAMBAHAN: Kirim permissions ke frontend
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new BadRequestError('User not found');
    }

    const companies = await this.authRepo.getUserCompanies(userId);

    return {
      user,
      companies: companies.map((cu) => ({
        id: cu.company.id,
        name: cu.company.name,
        role: cu.role.name,
      })),
    };
  }

  // ✅ TAMBAHAN: Method untuk switch company (dipanggil saat user ganti company)
  async switchCompany(userId: string, companyId: string) {
    // Verify user has access to this company
    const companyUser = await prisma.companyUser.findFirst({
      where: {
        userId,
        companyId,
        isActive: true,
      },
      include: {
        company: true,
        role: true,
      },
    });

    if (!companyUser) {
      throw new ForbiddenError('You do not have access to this company');
    }

    // Get permissions for new company
    const permissions = await this.getUserPermissions(userId, companyId);

    return {
      company: {
        id: companyUser.company.id,
        name: companyUser.company.name,
        role: companyUser.role.name,
      },
      permissions,
    };
  }
}