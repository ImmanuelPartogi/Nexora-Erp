// ============================================
// src/config/env.ts - FIXED
// ============================================
import dotenv from 'dotenv';
dotenv.config();

/**
 * Comma-separated list of allowed CORS origins.
 * Supports multiple frontend dev servers (e.g. Vite ports 5173/5174, web 3001).
 */
const DEFAULT_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3001',
];

function parseCorsOrigins(raw: string | undefined): string[] {
  if (!raw) return DEFAULT_CORS_ORIGINS;
  const origins = raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return origins.length > 0 ? origins : DEFAULT_CORS_ORIGINS;
}

export const ENV = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  CORS_ORIGINS: parseCorsOrigins(process.env.CORS_ORIGIN),
} as const;

// Validate required env vars
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required in .env file');
}

if (!ENV.JWT_SECRET) {
  throw new Error('JWT_SECRET is required. Set it in your .env file.');
}

if (ENV.JWT_SECRET.length < 32 && ENV.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be at least 32 characters in production.');
}


