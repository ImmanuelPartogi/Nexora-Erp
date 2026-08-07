// ============================================
// FILE: backend/src/modules/data/vendor/vendor.routes.ts
// FIX: Use validateBody() instead of validate()
// ============================================
import { Router } from 'express';
import { VendorController } from './vendor.controller';
import { validateBody } from '../../../shared/middleware/validation.middleware';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { requireCompany } from '../../../shared/middleware/tenant.middleware';
import { authorize } from '../../../shared/middleware/permission.middleware';
import { auditLog } from '../../../shared/middleware/audit.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import {
  createVendorSchema,
  updateVendorSchema,
} from './vendor.validation';

const router = Router();
const vendorController = new VendorController();

// ============================================
// MIDDLEWARE STACK (Applied to all routes)
// ============================================
router.use(authenticate);      // ✅ Step 1: Verify JWT & set req.user
router.use(requireCompany);    // ✅ Step 2: Verify company access & set req.activeCompanyId

// ============================================
// ROUTES
// ============================================

/**
 * @route   GET /api/v1/vendors
 * @desc    List vendors with pagination
 * @access  Private (requires vendors.view permission)
 */
router.get(
  '/',
  authorize(PERMISSIONS.VENDOR_VIEW),
  vendorController.list
);

/**
 * @route   GET /api/v1/vendors/:id
 * @desc    Get vendor by ID
 * @access  Private (requires vendors.view permission)
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.VENDOR_VIEW),
  vendorController.getById
);

/**
 * @route   POST /api/v1/vendors
 * @desc    Create new vendor
 * @access  Private (requires vendors.create permission)
 */
router.post(
  '/',
  authorize(PERMISSIONS.VENDOR_CREATE),
  validateBody(createVendorSchema), // ✅ FIXED: Use validateBody for body-only schema
  auditLog('data.vendor', 'vendor'),
  vendorController.create
);

/**
 * @route   PUT /api/v1/vendors/:id
 * @desc    Update vendor
 * @access  Private (requires vendors.edit permission)
 */
router.put(
  '/:id',
  authorize(PERMISSIONS.VENDOR_EDIT),
  validateBody(updateVendorSchema), // ✅ FIXED: Use validateBody for body-only schema
  auditLog('data.vendor', 'vendor'),
  vendorController.update
);

/**
 * @route   DELETE /api/v1/vendors/:id
 * @desc    Delete vendor (soft delete)
 * @access  Private (requires vendors.delete permission)
 */
router.delete(
  '/:id',
  authorize(PERMISSIONS.VENDOR_DELETE),
  auditLog('data.vendor', 'vendor'),
  vendorController.delete
);

export default router;