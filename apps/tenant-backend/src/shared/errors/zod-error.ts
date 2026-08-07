// src/shared/errors/zod-error.ts
import { ZodError, ZodIssue } from 'zod';

export const formatZodError = (error: ZodError) => {
  return error.issues.map((issue: ZodIssue) => ({
    path: issue.path.join('.') || 'body',
    message: issue.message,
  }));
};
