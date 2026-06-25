// ============================================
// src/shared/db/prisma.ts - FIXED & IMPROVED
// ============================================
import { PrismaClient } from '@prisma/client';
import { ENV } from '../../config/env';

const globalForPrisma = global as typeof global & {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ENV.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (ENV.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
};

// Test connection on startup
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });