// src/modules/operations/production/production.routes.ts
import { Router } from 'express';
import { ProductionController } from './production.controller';
import { validateBody } from '../../../shared/middleware/validation.middleware';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { requireCompany } from '../../../shared/middleware/tenant.middleware';
import { authorize } from '../../../shared/middleware/permission.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { createProductionSchema } from './production.validation';

const router = Router();
const productionController = new ProductionController();

router.use(authenticate);
router.use(requireCompany);

// ✅ List productions
router.get(
  '/', 
  authorize(PERMISSIONS.PRODUCTION_VIEW), 
  productionController.list
);

// ✅ Create production
router.post(
  '/',
  authorize(PERMISSIONS.PRODUCTION_CREATE),
  validateBody(createProductionSchema),
  productionController.create
);

// ✅ NEW: Start production (draft → in_progress)
router.post(
  '/:id/start',
  authorize(PERMISSIONS.PRODUCTION_EDIT),
  productionController.start
);

// ✅ NEW: Complete production (in_progress → completed)
router.post(
  '/:id/complete',
  authorize(PERMISSIONS.PRODUCTION_EDIT),
  productionController.complete
);

// ✅ NEW: Cancel production
router.post(
  '/:id/cancel',
  authorize(PERMISSIONS.PRODUCTION_EDIT),
  productionController.cancel
);

export default router;