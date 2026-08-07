// src/modules/data/location/location.validation.ts
import { z } from 'zod';

export const createLocationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    type: z.enum(['warehouse', 'office', 'branch', 'other']).optional(),
    address: z.string().optional(),
    city: z.string().max(100).optional(),
    province: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    phone: z.string().max(50).optional(),
    description: z.string().optional(),
  }),
});

export const updateLocationSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    type: z.enum(['warehouse', 'office', 'branch', 'other']).optional(),
    address: z.string().optional(),
    city: z.string().max(100).optional(),
    province: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    phone: z.string().max(50).optional(),
    description: z.string().optional(),
  }),
});