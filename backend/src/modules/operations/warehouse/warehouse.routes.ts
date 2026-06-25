// src/modules/operations/warehouse/warehouse.routes.ts
import { Router } from 'express';
import { WarehouseController } from './warehouse.controller';
import { validate } from '../../../shared/middleware/validation.middleware';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { requireCompany } from '../../../shared/middleware/tenant.middleware';
import { authorize } from '../../../shared/middleware/permission.middleware';
import { auditLog } from '../../../shared/middleware/audit.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { createWarehouseSchema, updateWarehouseSchema } from './warehouse.validation';

const router = Router();
const warehouseController = new WarehouseController();

router.use(authenticate);
router.use(requireCompany);

router.get(
  '/',
  authorize(PERMISSIONS.WAREHOUSE_VIEW),
  warehouseController.list
);

router.get(
  '/:id',
  authorize(PERMISSIONS.WAREHOUSE_VIEW),
  warehouseController.getById
);

router.post(
  '/',
  authorize(PERMISSIONS.WAREHOUSE_CREATE),
  validate(createWarehouseSchema),
  auditLog('operations.warehouse', 'warehouse'),
  warehouseController.create
);

router.put(
  '/:id',
  authorize(PERMISSIONS.WAREHOUSE_EDIT),
  validate(updateWarehouseSchema),
  auditLog('operations.warehouse', 'warehouse'),
  warehouseController.update
);

router.delete(
  '/:id',
  authorize(PERMISSIONS.WAREHOUSE_DELETE),
  auditLog('operations.warehouse', 'warehouse'),
  warehouseController.delete
);

export default router;