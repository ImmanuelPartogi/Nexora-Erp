// ============================================
// FILE: backend/src/shared/middleware/error.middleware.ts
// FIX: Comprehensive error handling + prevent server crash
// ============================================
import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../errors/AppError';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Format Zod v4 errors safely into a field-keyed map.
 * Zod v4 uses `.issues` (`.errors` was the v3 property).
 */
const formatZodErrors = (zodError: ZodError): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};

  if (!zodError.issues || !Array.isArray(zodError.issues)) {
    return { general: ['Validation failed'] };
  }

  try {
    zodError.issues.forEach((issue) => {
      const path = issue.path && issue.path.length > 0
        ? issue.path.join('.')
        : 'general';

      if (!errors[path]) {
        errors[path] = [];
      }

      errors[path].push(issue.message || 'Invalid value');
    });
  } catch (formatError) {
    console.error('Error formatting Zod errors:', formatError);
    return { general: ['Validation failed'] };
  }

  return errors;
};

/**
 * ✅ Global error handler
 * This MUST be the last middleware in the chain
 */
export const errorHandler = (
  err: Error | AppError | ZodError | Prisma.PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // ✅ Prevent "Cannot set headers after they are sent"
  if (res.headersSent) {
    return next(err);
  }

  // SECURITY: Sanitize the request body before logging to avoid leaking passwords
  // or other sensitive fields in error logs.
  const SENSITIVE_FIELDS = ['password', 'confirmPassword', 'token', 'authorization'];
  const sanitizedBody = req.body && typeof req.body === 'object'
    ? Object.fromEntries(
        Object.entries(req.body as Record<string, unknown>).map(([key, value]) => [
          key,
          SENSITIVE_FIELDS.includes(key.toLowerCase()) ? '[REDACTED]' : value,
        ])
      )
    : req.body;

  console.error('Error caught by error handler:', {
    type: err.constructor.name,
    message: err.message,
    url: req.originalUrl,
    method: req.method,
    body: sanitizedBody,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // ============================================
  // 1. Handle Zod validation errors
  // ============================================
  if (err instanceof ZodError) {
    const errors = formatZodErrors(err);
    
    res.status(422).json({
      success: false,
      error: 'Validation failed',
      errors,
    });
    return;
  }

  // ============================================
  // 2. Handle AppError (custom errors)
  // ============================================
  if (err instanceof AppError) {
    const response: {
      success: boolean;
      error: string;
      errors?: Record<string, string[]>;
    } = {
      success: false,
      error: err.message,
    };

    // ✅ Add validation errors if present
    if (err.errors && Object.keys(err.errors).length > 0) {
      response.errors = err.errors;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // ============================================
  // 3. Handle Prisma errors
  // ============================================
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        // Unique constraint violation
        const field = (err.meta?.target as string[])?.join(', ') || 'field';
        res.status(409).json({
          success: false,
          error: `A record with this ${field} already exists`,
        });
        return;
      }

      case 'P2025': {
        // Record not found
        res.status(404).json({
          success: false,
          error: 'Record not found',
        });
        return;
      }

      case 'P2003': {
        // Foreign key constraint failed
        res.status(400).json({
          success: false,
          error: 'Related record not found',
        });
        return;
      }

      case 'P2014': {
        // Relation violation
        res.status(400).json({
          success: false,
          error: 'Cannot delete record because it has related data',
        });
        return;
      }

      default: {
        res.status(400).json({
          success: false,
          error: 'Database operation failed',
        });
        return;
      }
    }
  }

  // ============================================
  // 4. Handle Prisma validation errors
  // ============================================
  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      error: 'Invalid data provided',
    });
    return;
  }

  // ============================================
  // 5. Handle unknown/unexpected errors
  // ============================================
  console.error('🔥 UNEXPECTED ERROR:', err);
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal server error',
  });
};