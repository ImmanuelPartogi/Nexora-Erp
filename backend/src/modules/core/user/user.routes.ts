// ============================================
// src/modules/core/user/user.routes.ts
// ============================================
import { Router } from 'express';
import { UserController } from './user.controller';
import { validate } from '../../../shared/middleware/validation.middleware';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { requireCompany } from '../../../shared/middleware/tenant.middleware';
import { authorize } from '../../../shared/middleware/permission.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { createUserSchema, updateUserSchema } from './user.validation';

const router = Router();
const userController = new UserController();

router.use(authenticate);
router.use(requireCompany);

router.get(
  '/',
  authorize(PERMISSIONS.USER_VIEW),
  userController.list
);

router.get(
  '/:id',
  authorize(PERMISSIONS.USER_VIEW),
  userController.getById
);

router.post(
  '/',
  authorize(PERMISSIONS.USER_CREATE),
  validate(createUserSchema),
  userController.create
);

router.put(
  '/:id',
  authorize(PERMISSIONS.USER_EDIT),
  validate(updateUserSchema),
  userController.update
);

router.delete(
  '/:id',
  authorize(PERMISSIONS.USER_DELETE),
  userController.deactivate
);

export default router;