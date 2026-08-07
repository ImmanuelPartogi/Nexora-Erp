// src/modules/core/auth/auth.repository.ts
import { Prisma, User } from '@prisma/client';
import { prisma } from '../../../shared/db/prisma';

export type UserCompany = Prisma.CompanyUserGetPayload<{
  include: {
    company: true;
    role: {
      select: {
        name: true;
      };
    };
  };
}>;

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        ...data,
      },
    });
  }

  async getUserCompanies(userId: string): Promise<UserCompany[]> {
    return prisma.companyUser.findMany({
      where: {
        userId,
        isActive: true,
        company: {
            deletedAt: null,
        },
      },
      include: {
        company: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}
