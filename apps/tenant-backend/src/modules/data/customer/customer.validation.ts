// src/modules/data/customer/customer.validation.ts
import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const listQuerySchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val || '1', 10)),
  limit: z.string().optional().transform((val) => parseInt(val || '10', 10)),
  search: z.string().optional(),
  isActive: z.string().optional().transform((val) => val === 'true'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});