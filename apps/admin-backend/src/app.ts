import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

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

  return app;
};
