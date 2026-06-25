// src/modules/data/location/location.routes.ts
import { Router } from 'express';
import { LocationController } from './location.controller';
import { validate } from '../../../shared/middleware/validation.middleware';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { requireCompany } from '../../../shared/middleware/tenant.middleware';
import { authorize } from '../../../shared/middleware/permission.middleware';
import { auditLog } from '../../../shared/middleware/audit.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { createLocationSchema, updateLocationSchema } from './location.validation';

const router = Router();
const locationController = new LocationController();

router.use(authenticate);
router.use(requireCompany);

router.get(
  '/',
  authorize(PERMISSIONS.LOCATION_VIEW),
  locationController.list
);

router.get(
  '/:id',
  authorize(PERMISSIONS.LOCATION_VIEW),
  locationController.getById
);

router.post(
  '/',
  authorize(PERMISSIONS.LOCATION_CREATE),
  validate(createLocationSchema),
  auditLog('data.location', 'location'),
  locationController.create
);

router.put(
  '/:id',
  authorize(PERMISSIONS.LOCATION_EDIT),
  validate(updateLocationSchema),
  auditLog('data.location', 'location'),
  locationController.update
);

router.delete(
  '/:id',
  authorize(PERMISSIONS.LOCATION_DELETE),
  auditLog('data.location', 'location'),
  locationController.delete
);

export default router;