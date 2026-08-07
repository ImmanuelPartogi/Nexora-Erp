// ============================================
// src/modules/core/user/user.service.ts
// ============================================
import { NotFoundError, ConflictError } from '../../../shared/errors/AppError';
import { HashUtil } from '../../../shared/utils/hash.util';
import { UserRepository } from './user.repository';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserListQuery,
  UserResponse,
} from './user.types';

export class UserService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async list(companyId: string, query: UserListQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.search) {
      where.user = {
        OR: [
          { name: { contains: query.search } },
          { email: { contains: query.search } },
        ],
      };
    }

    if (query.isActive !== undefined) {
      where.user = {
        ...((where.user as Record<string, unknown>) || {}),
        isActive: query.isActive,
      };
    }

    if (query.roleId) {
      where.roleId = query.roleId;
    }

    const orderBy: Record<string, unknown> = {};
    if (query.sortBy) {
      if (query.sortBy === 'name' || query.sortBy === 'email') {
        orderBy.user = {
          [query.sortBy]: query.sortOrder || 'asc',
        };
      } else {
        orderBy[query.sortBy] = query.sortOrder || 'asc';
      }
    } else {
      orderBy.createdAt = 'desc';
    }

    const result = await this.userRepo.findAllByCompany(companyId, {
      skip,
      take: limit,
      where,
      orderBy,
    });

    const formattedData = result.data.map((item) => ({
      ...item.user,
      companyUser: {
        role: item.role,
      },
    }));

    return {
      data: formattedData,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getById(userId: string, companyId: string): Promise<UserResponse> {
    const companyUser = await this.userRepo.findById(userId, companyId);

    if (!companyUser) {
      throw new NotFoundError('User not found in this company');
    }

    return {
      ...companyUser.user,
      companyUser: {
        role: companyUser.role,
      },
    };
  }

  async create(data: CreateUserRequest, companyId: string) {
    // Check if email already exists
    const existingUser = await this.userRepo.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const hashedPassword = await HashUtil.hash(data.password);

    return this.userRepo.create(
      {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
      companyId,
      data.roleId
    );
  }

  async update(
    userId: string,
    data: UpdateUserRequest,
    companyId: string
  ) {
    // Check if user exists in company
    await this.getById(userId, companyId);

    // Check email uniqueness if email is being updated
    if (data.email) {
      const existingUser = await this.userRepo.findByEmail(data.email);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictError('Email already in use');
      }
    }

    // Hash password if provided
    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      isActive?: boolean;
    } = {
      name: data.name,
      email: data.email,
      isActive: data.isActive,
    };

    if (data.password) {
      updateData.password = await HashUtil.hash(data.password);
    }

    return this.userRepo.update(
      userId,
      companyId,
      updateData,
      data.roleId
    );
  }

  async deactivate(userId: string, companyId: string) {
    await this.getById(userId, companyId);
    return this.userRepo.deactivate(userId, companyId);
  }
}