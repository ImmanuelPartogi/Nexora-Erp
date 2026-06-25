// ============================================
// FILE: backend/src/server.ts
// FIX: Better error handling + prevent crash
// ============================================
import { createApp } from './app';
import { ENV } from './config/env';
import { disconnectPrisma } from './config/database';

const app = createApp();

const server = app.listen(ENV.PORT, () => {
  console.log('🚀 NEXORA ERP Backend');
  console.log(`📡 Server running on port ${ENV.PORT}`);
  console.log(`🌍 Environment: ${ENV.NODE_ENV}`);
  console.log(`🔗 API: http://localhost:${ENV.PORT}/api/v1`);
  console.log(`💚 Health: http://localhost:${ENV.PORT}/api/v1/health`);
});

// ============================================
// Graceful shutdown handler
// ============================================
const gracefulShutdown = async (signal: string) => {
  console.log(`\n⚠️  ${signal} received, shutting down gracefully...`);
  
  server.close(async () => {
    console.log('✅ HTTP server closed');
    
    try {
      await disconnectPrisma();
      console.log('✅ Database connection closed');
    } catch (error) {
      console.error('❌ Error closing database:', error);
    }
    
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// ============================================
// Process event handlers
// ============================================

// SIGTERM/SIGINT - Graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled promise rejection - Log and continue (DON'T CRASH)
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Promise Rejection:', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise,
  });
  
  // ✅ DON'T throw - let error handler catch it
  // This prevents server crash
});

// Uncaught exception - Log and exit
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
  });
  
  // ✅ Exit gracefully
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Process warning
process.on('warning', (warning) => {
  console.warn('⚠️  Process Warning:', warning);
});