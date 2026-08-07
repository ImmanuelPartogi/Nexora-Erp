// src/modules/operations/stock/stock.routes.ts
import { Router } from 'express';
import { StockController } from './stock.controller';
import { validateBody } from '../../../shared/middleware/validation.middleware';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { requireCompany } from '../../../shared/middleware/tenant.middleware';
import { authorize } from '../../../shared/middleware/permission.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { stockMovementBodySchema } from './stock.validation';

const router = Router();
const stockController = new StockController();

router.use(authenticate);
router.use(requireCompany);

// ✅ GET /stocks - List semua stock
router.get(
  '/',
  authorize(PERMISSIONS.STOCK_VIEW),
  stockController.list
);

// ✅ NEW: GET /stocks/check - Check current stock (untuk validasi frontend)
router.get(
  '/check',
  authorize(PERMISSIONS.STOCK_VIEW),
  stockController.getStock
);

// ✅ POST /stocks/movement - Create stock movement
router.post(
  '/movement',
  authorize(PERMISSIONS.STOCK_CREATE),
  validateBody(stockMovementBodySchema),
  stockController.movement
);

// ✅ GET /stocks/movements - List movement history
router.get(
  '/movements',
  authorize(PERMISSIONS.STOCK_VIEW),
  stockController.listMovements
);

export default router;