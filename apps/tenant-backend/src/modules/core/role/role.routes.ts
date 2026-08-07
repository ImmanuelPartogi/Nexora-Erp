// ============================================
// FILE: backend/src/modules/core/role/role.routes.ts
// FIX: Add requireCompany + use validateBody + use PERMISSIONS constant
// ============================================

import { Router } from 'express';
import { RoleController } from './role.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { requireCompany } from '../../../shared/middleware/tenant.middleware'; // ✅ ADDED
import { authorize } from '../../../shared/middleware/permission.middleware';
import { validateBody } from '../../../shared/middleware/validation.middleware'; // ✅ FIXED
import { PERMISSIONS } from '../../../shared/constants/permissions'; // ✅ ADDED
import { createRoleSchema, updateRoleSchema } from './role.validation';

const router = Router();
const roleController = new RoleController();

// ============================================
// MIDDLEWARE STACK (Applied to all routes)
// ============================================
router.use(authenticate);      // ✅ Step 1: Verify JWT & set req.user
router.use(requireCompany);    // ✅ ADDED: Step 2: Verify company access & set req.activeCompanyId

// ============================================
// ROUTES
// ============================================

/**
 * @route   GET /api/v1/roles/permissions
 * @desc    Get available permissions list
 * @access  Private (requires roles.view permission)
 * @note    MUST be BEFORE /:id route to avoid path conflict
 */
router.get(
  '/permissions',
  authorize(PERMISSIONS.ROLE_VIEW), // ✅ FIXED: Use constant
  roleController.getPermissions
);

/**
 * @route   GET /api/v1/roles
 * @desc    List roles with pagination
 * @access  Private (requires roles.view permission)
 */
router.get(
  '/',
  authorize(PERMISSIONS.ROLE_VIEW), // ✅ FIXED: Use constant
  roleController.list
);

/**
 * @route   GET /api/v1/roles/:id
 * @desc    Get role by ID
 * @access  Private (requires roles.view permission)
 * @note    MUST be AFTER specific routes like /permissions
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.ROLE_VIEW), // ✅ FIXED: Use constant
  roleController.getById
);

/**
 * @route   POST /api/v1/roles
 * @desc    Create new role
 * @access  Private (requires roles.create permission)
 */
router.post(
  '/',
  authorize(PERMISSIONS.ROLE_CREATE), // ✅ FIXED: Use constant
  validateBody(createRoleSchema), // ✅ FIXED: Use validateBody
  roleController.create
);

/**
 * @route   PUT /api/v1/roles/:id
 * @desc    Update role
 * @access  Private (requires roles.edit permission)
 */
router.put(
  '/:id',
  authorize(PERMISSIONS.ROLE_EDIT), // ✅ FIXED: Use constant
  validateBody(updateRoleSchema), // ✅ FIXED: Use validateBody
  roleController.update
);

/**
 * @route   DELETE /api/v1/roles/:id
 * @desc    Delete role (soft delete)
 * @access  Private (requires roles.delete permission)
 */
router.delete(
  '/:id',
  authorize(PERMISSIONS.ROLE_DELETE), // ✅ FIXED: Use constant
  roleController.delete
);

export default router;