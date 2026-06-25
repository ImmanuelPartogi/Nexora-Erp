// ============================================
// FILE: backend/src/modules/data/asset/asset.routes.ts
// FIX: Use validateBody() for consistency with other modules
// ============================================
import { Router } from 'express';
import { AssetController } from './asset.controller';
import { validateBody, validateParams } from '../../../shared/middleware/validation.middleware';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { requireCompany } from '../../../shared/middleware/tenant.middleware';
import { authorize } from '../../../shared/middleware/permission.middleware';
import { auditLog } from '../../../shared/middleware/audit.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { createAssetSchema, updateAssetSchema } from './asset.validation';
import { z } from 'zod';

const router = Router();
const assetController = new AssetController();

// ✅ Middleware stack
router.use(authenticate);
router.use(requireCompany);

// ✅ Param validation schema
const idParamSchema = z.object({
  id: z.string().uuid('Invalid asset ID format'),
});

/**
 * @route   GET /api/v1/assets
 * @desc    List assets with pagination
 * @access  Private (requires asset.view permission)
 */
router.get(
  '/',
  authorize(PERMISSIONS.ASSET_VIEW),
  assetController.list
);

/**
 * @route   GET /api/v1/assets/:id
 * @desc    Get asset by ID
 * @access  Private (requires asset.view permission)
 */
router.get(
  '/:id',
  validateParams(idParamSchema),
  authorize(PERMISSIONS.ASSET_VIEW),
  assetController.getById
);

/**
 * @route   POST /api/v1/assets
 * @desc    Create new asset
 * @access  Private (requires asset.create permission)
 */
router.post(
  '/',
  authorize(PERMISSIONS.ASSET_CREATE),
  validateBody(createAssetSchema), // ✅ FIXED: Use validateBody instead of validate
  auditLog('data.asset', 'asset'),
  assetController.create
);

/**
 * @route   PUT /api/v1/assets/:id
 * @desc    Update asset
 * @access  Private (requires asset.edit permission)
 */
router.put(
  '/:id',
  validateParams(idParamSchema),
  authorize(PERMISSIONS.ASSET_EDIT),
  validateBody(updateAssetSchema), // ✅ FIXED: Use validateBody instead of validate
  auditLog('data.asset', 'asset'),
  assetController.update
);

/**
 * @route   DELETE /api/v1/assets/:id
 * @desc    Delete asset (soft delete)
 * @access  Private (requires asset.delete permission)
 */
router.delete(
  '/:id',
  validateParams(idParamSchema),
  authorize(PERMISSIONS.ASSET_DELETE),
  auditLog('data.asset', 'asset'),
  assetController.delete
);

export default router;