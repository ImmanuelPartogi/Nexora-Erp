// ============================================
// FILE: frontend/src/modules/data/employee/employee.schema.ts
// ✅ UPDATED: Add User account fields
// ============================================

import { z } from 'zod';

export const employeeSchema = z.object({
  // Employee basic info
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  joinDate: z.string().optional(),
  salary: z.coerce.number().min(0).optional(),
  
  // ✅ TAMBAHAN: User account fields
  createUserAccount: z.boolean().optional().default(false),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  roleId: z.string().optional(),
})
.refine(
  (data) => {
    // ✅ VALIDASI: Jika createUserAccount = true, maka email, password, roleId wajib
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

export const employeeUpdateSchema = z.object({
  // Employee basic info
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  joinDate: z.string().optional(),
  salary: z.coerce.number().min(0).optional(),
  status: z.enum(['active', 'inactive', 'resigned']).optional(),
  
  // ✅ TAMBAHAN: Update user account
  updateUserAccount: z.boolean().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  roleId: z.string().optional(),
  userIsActive: z.boolean().optional(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
export type EmployeeUpdateFormData = z.infer<typeof employeeUpdateSchema>;