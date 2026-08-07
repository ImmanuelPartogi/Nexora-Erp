// ============================================
// FILE: src/shared/utils/response.util.ts
// FIX: Tambah method paginated() untuk handle paginated response
// ============================================
import { Response } from 'express';

export class ResponseUtil {
  // ✅ Method biasa untuk single entity
  static success(res: Response, data: any, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  // ✅ NEW: Method khusus untuk paginated response
  static paginated(
    res: Response, 
    data: any[], 
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    message = 'Success'
  ) {
    return res.status(200).json({
      success: true,
      message,
      data,           // ← Array langsung, tidak di-wrap!
      pagination,     // ← Pagination di root level
    });
  }

  static created(res: Response, data: any, message = 'Created successfully') {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }

  static error(res: Response, message: string, statusCode = 400, errors?: any) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
}