// ============================================
// src/modules/core/permission/permission.routes.ts
// ============================================
import { Router } from 'express';
import { PermissionController } from './permission.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { requireCompany } from '../../../shared/middleware/tenant.middleware';
import { authorize } from '../../../shared/middleware/permission.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';

const router = Router();
const permissionController = new PermissionController();

router.use(authenticate);
router.use(requireCompany);

// List all permissions
router.get(
  '/',
  authorize(PERMISSIONS.PERMISSION_VIEW),
  permissionController.list
);

// Get permissions grouped by module
router.get(
  '/by-module',
  authorize(PERMISSIONS.PERMISSION_VIEW),
  permissionController.listByModule
);

// Get single permission
router.get(
  '/:id',
  authorize(PERMISSIONS.PERMISSION_VIEW),
  permissionController.getById
);

export default router;