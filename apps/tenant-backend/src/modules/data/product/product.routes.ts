// ============================================
// FILE: backend/src/modules/data/product/product.routes.ts
// FIX: Gunakan validateBody() untuk schema body langsung
// ============================================
import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { requireCompany } from '../../../shared/middleware/tenant.middleware';
import { authorize } from '../../../shared/middleware/permission.middleware';
import { validateBody, validateParams } from '../../../shared/middleware/validation.middleware';
import { createProductSchema, updateProductSchema } from './product.validation';
import { z } from 'zod';

const router = Router();
const controller = new ProductController();

// ✅ URUTAN MIDDLEWARE PENTING:
// 1. authenticate → set req.user
// 2. requireCompany → set req.activeCompanyId
// 3. authorize → check permission
router.use(authenticate);
router.use(requireCompany);

// ✅ Schema untuk validasi ID di params
const idParamSchema = z.object({
  id: z.string().uuid('Invalid product ID format'),
});

// GET /api/v1/products
router.get(
  '/',
  authorize('data.product.view'),
  controller.list
);

// GET /api/v1/products/:id
router.get(
  '/:id',
  validateParams(idParamSchema),
  authorize('data.product.view'),
  controller.getById
);

// POST /api/v1/products
router.post(
  '/',
  authorize('data.product.create'),
  validateBody(createProductSchema), // 👈 FIX: Ganti validate() jadi validateBody()
  controller.create
);

// PUT /api/v1/products/:id
router.put(
  '/:id',
  validateParams(idParamSchema),
  authorize('data.product.edit'),
  validateBody(updateProductSchema), // 👈 FIX: Ganti validate() jadi validateBody()
  controller.update
);

// DELETE /api/v1/products/:id
router.delete(
  '/:id',
  validateParams(idParamSchema),
  authorize('data.product.delete'),
  controller.delete
);

export default router;