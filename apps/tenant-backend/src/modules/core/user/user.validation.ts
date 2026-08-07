// ============================================
// src/modules/core/user/user.validation.ts
// ============================================
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  roleId: z.string().uuid('Invalid role ID'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  roleId: z.string().uuid('Invalid role ID').optional(),
  isActive: z.boolean().optional(),
});