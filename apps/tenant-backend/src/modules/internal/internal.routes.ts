import { Router } from 'express';
import { InternalController } from './internal.controller';
import { internalAuthMiddleware } from '../../shared/middleware/internal-auth.middleware';

const router = Router();
const controller = new InternalController();

// All internal routes are protected by internalAuthMiddleware
router.use(internalAuthMiddleware);

router.get('/tenants', controller.getTenants);
router.get('/stats', controller.getStats);
router.get('/analytics/api-usage', controller.getApiUsage);
router.get('/analytics/errors', controller.getErrors);

export default router;
