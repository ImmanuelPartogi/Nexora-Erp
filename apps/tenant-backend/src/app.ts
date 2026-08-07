// ============================================
// FILE: backend/src/app.ts
// FIX: Better middleware order + async error handling
// ============================================
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { ENV } from './config/env';
import routes from './routes';
import { errorHandler } from './shared/middleware/error.middleware';

export const createApp = (): Application => {
  const app = express();

  // ============================================
  // Security middleware
  // ============================================
  app.use(helmet());

  // ============================================
  // CORS
  // ============================================
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no Origin (same-origin, server-to-server, curl, etc.)
        if (!origin) return callback(null, true);
        if (ENV.CORS_ORIGINS.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true,
    })
  );

  // ============================================
  // Rate limiting
  // ============================================
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // ============================================
  // Body parser
  // ============================================
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ============================================
  // Request logging (development only)
  // SECURITY: Never log sensitive fields like passwords, even in development.
  // ============================================
  const SENSITIVE_FIELDS = ['password', 'confirmPassword', 'token', 'authorization'];

  const sanitizeBody = (body: unknown): unknown => {
    if (!body || typeof body !== 'object') return body;
    return Object.fromEntries(
      Object.entries(body as Record<string, unknown>).map(([key, value]) => [
        key,
        SENSITIVE_FIELDS.includes(key.toLowerCase()) ? '[REDACTED]' : value,
      ])
    );
  };

  if (ENV.NODE_ENV === 'development') {
    app.use((req: Request, _res: Response, next: NextFunction) => {
      console.log(`${req.method} ${req.path}`, {
        body: sanitizeBody(req.body),
        query: req.query,
        params: req.params,
      });
      next();
    });
  }

  // ============================================
  // Health check (no auth required)
  // ============================================
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // ============================================
  // API Routes
  // ============================================
  app.use('/api/v1', routes);

  // ============================================
  // 404 Handler
  // ============================================
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
    });
  });

  // ============================================
  // Global Error Handler (MUST BE LAST)
  // ============================================
  app.use(errorHandler);

  return app;
};