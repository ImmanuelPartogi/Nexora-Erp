// ============================================
// FILE: backend/src/shared/errors/AppError.ts
// FIX: Update error format to match error handler expectation
// ============================================

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: Record<string, string[]>; // ✅ FIXED: Changed from any[] to Record

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    errors?: Record<string, string[]> // ✅ FIXED: Changed signature
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(
    message = 'Bad Request', 
    errors?: Record<string, string[]> // ✅ FIXED: Changed signature
  ) {
    super(message, 400, true, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, true);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, true);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, true);
  }
}

export class ValidationError extends AppError {
  constructor(
    message = 'Validation failed', 
    errors?: Record<string, string[]> // ✅ FIXED: Changed signature
  ) {
    super(message, 422, true, errors);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error') {
    super(message, 500, false);
  }
}