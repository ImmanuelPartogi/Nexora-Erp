// src/modules/operations/lease/lease.routes.ts
import { Router } from 'express';
import { LeaseController } from './lease.controller';
import { validateBody } from '../../../shared/middleware/validation.middleware';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { requireCompany } from '../../../shared/middleware/tenant.middleware';
import { authorize } from '../../../shared/middleware/permission.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { createLeaseSchema } from './lease.validation';

const router = Router();
const leaseController = new LeaseController();

router.use(authenticate);
router.use(requireCompany);

router.get('/', authorize(PERMISSIONS.LEASE_VIEW), leaseController.list);

router.get('/:id', authorize(PERMISSIONS.LEASE_VIEW), leaseController.getById);

router.post(
  '/',
  authorize(PERMISSIONS.LEASE_CREATE),
  validateBody(createLeaseSchema),
  leaseController.create
);

// ✅ TAMBAH: Complete lease
router.post(
  '/:id/complete',
  authorize(PERMISSIONS.LEASE_EDIT),
  leaseController.complete
);

// ✅ TAMBAH: Cancel lease
router.post(
  '/:id/cancel',
  authorize(PERMISSIONS.LEASE_EDIT),
  leaseController.cancel
);

export default router;