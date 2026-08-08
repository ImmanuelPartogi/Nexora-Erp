import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import adminUserRoutes from './routes/admin-users.routes';
import tenantRoutes from './routes/tenants.routes';
import analyticsRoutes from './routes/analytics.routes';

export const createApp = () => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'nexora-admin-backend',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/admin-users', adminUserRoutes);
  app.use('/api/v1/tenants', tenantRoutes);
  app.use('/api/v1/analytics', analyticsRoutes);

  return app;
};
