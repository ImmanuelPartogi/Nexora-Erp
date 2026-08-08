// ============================================
// FILE: apps/tenant-backend/src/shared/middleware/rate-limit.middleware.ts
// Rate Limiter Middleware for Auth & Sensitive Endpoints
// ============================================

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Strict Rate Limiter for Login Attempts
 * Limits: Max 5 failed/attempts per 1 minute per (IP + email) combination
 */
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  limit: 5, // max 5 attempts per window
  standardHeaders: true, // Return rate limit info in standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  validate: false,
  keyGenerator: (req: Request): string => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : 'unknown-email';
    return `${ip}:${email}`;
  },
  handler: (_req: Request, res: Response) => {
    res.setHeader('Retry-After', '60');
    res.status(429).json({
      success: false,
      error: 'Too many login attempts. Please try again after 1 minute.',
    });
  },
});

/**
 * Reset rate-limit hit counter upon successful user login
 */
export const resetLoginRateLimit = (req: Request): void => {
  if (typeof loginLimiter.resetKey === 'function') {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : 'unknown-email';
    loginLimiter.resetKey(`${ip}:${email}`);
  }
};
