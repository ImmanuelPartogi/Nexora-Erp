// ============================================
// FILE: backend/src/modules/data/employee/employee.validation.ts
// ============================================
import { z } from 'zod';
import { paginationQuerySchema, booleanFromQueryString, dateStringSchema } from '../../../shared/utils/validation.util';

const employeeStatusEnum = z.enum(['active', 'inactive', 'resigned']);

// CREATE SCHEMA
export const createEmployeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  code: z.string().max(50).optional(),
  email: z
    .string()
    .email('Invalid email format')
    .max(255)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  phone: z.string().max(20).optional(),
  position: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  joinDate: dateStringSchema.optional(),
  salary: z.number().positive('Salary must be positive').optional(),
  status: employeeStatusEnum.default('active'),

  createUserAccount: z.boolean().optional().default(false),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  roleId: z.string().uuid('Invalid role ID').optional(),
})
.refine(
  (data) => {
    if (data.createUserAccount) {
      return data.email && data.password && data.roleId;
    }
    return true;
  },
  {
    message: 'Email, password, and role are required when creating user account',
    path: ['createUserAccount'],
  }
);

// UPDATE SCHEMA
export const updateEmployeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200).optional(),
  email: z
    .string()
    .email('Invalid email format')
    .max(255)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  phone: z.string().max(20).optional(),
  position: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  joinDate: dateStringSchema.optional(),
  salary: z.number().positive('Salary must be positive').optional(),
  status: employeeStatusEnum.optional(),
  isActive: z.boolean().optional(),

  updateUserAccount: z.boolean().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  roleId: z.string().uuid('Invalid role ID').optional(),
  userIsActive: z.boolean().optional(),
});

// QUERY SCHEMA
export const listEmployeeQuerySchema = paginationQuerySchema.extend({
  search: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  status: employeeStatusEnum.optional(),
  isActive: booleanFromQueryString,
  hasUserAccount: booleanFromQueryString,
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type ListEmployeeQuery = z.infer<typeof listEmployeeQuerySchema>;