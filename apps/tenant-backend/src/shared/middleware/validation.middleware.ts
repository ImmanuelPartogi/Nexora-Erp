// ============================================
// FILE: backend/src/shared/middleware/validation.middleware.ts
// FIX: Bulletproof error handling + prevent server crash
// ============================================
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../errors/AppError';

/**
 * Format Zod v4 errors safely into a field-keyed map.
 * Zod v4 exposes issues via `.issues` (not `.errors`).
 */
const formatZodErrors = (zodError: ZodError): Record<string, string[]> => {
  const formattedErrors: Record<string, string[]> = {};

  if (!zodError.issues || !Array.isArray(zodError.issues)) {
    return { general: ['Validation failed'] };
  }

  try {
    zodError.issues.forEach((issue) => {
      const path = issue.path && issue.path.length > 0
        ? issue.path.join('.')
        : 'general';

      if (!formattedErrors[path]) {
        formattedErrors[path] = [];
      }

      const message = issue.message || 'Invalid value';
      formattedErrors[path].push(message);
    });
  } catch (formatError) {
    console.error('Error formatting Zod errors:', formatError);
    return { general: ['Validation failed'] };
  }

  return formattedErrors;
};

/**
 * ✅ Validate entire request (body, params, query)
 */
export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      }) as {
        body?: typeof req.body;
        params?: typeof req.params;
        query?: typeof req.query;
      };

      req.body = validated.body || req.body;
      req.params = validated.params || req.params;
      req.query = validated.query || req.query;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = formatZodErrors(error);
        return next(new BadRequestError('Validation failed', formattedErrors));
      }

      // ✅ Pass unknown errors to error handler
      next(error);
    }
  };
};

/**
 * ✅ Validate only request body (MOST COMMON)
 */
export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = formatZodErrors(error);
        return next(new BadRequestError('Validation failed', formattedErrors));
      }

      next(error);
    }
  };
};

/**
 * ✅ Validate only params
 */
export const validateParams = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.params);
      req.params = validated as typeof req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = formatZodErrors(error);
        return next(new BadRequestError('Invalid parameters', formattedErrors));
      }

      next(error);
    }
  };
};

/**
 * ✅ Validate only query
 */
export const validateQuery = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.query);
      req.query = validated as typeof req.query;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = formatZodErrors(error);
        return next(new BadRequestError('Invalid query parameters', formattedErrors));
      }

      next(error);
    }
  };
};