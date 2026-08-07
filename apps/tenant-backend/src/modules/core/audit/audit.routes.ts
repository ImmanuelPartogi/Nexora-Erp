// ============================================
// FILE 5: src/modules/core/audit/audit.routes.ts
// ============================================
import { Router } from 'express';
import { AuditLogController } from './audit.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { requireCompany } from '../../../shared/middleware/tenant.middleware';
import { authorize } from '../../../shared/middleware/permission.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';

const router = Router();
const auditController = new AuditLogController();

router.use(authenticate);
router.use(requireCompany);

// All audit routes require AUDIT_VIEW permission
router.get(
  '/',
  authorize(PERMISSIONS.AUDIT_VIEW),
  auditController.list
);

router.get(
  '/stats',
  authorize(PERMISSIONS.AUDIT_VIEW),
  auditController.getStats
);

router.get(
  '/:id',
  authorize(PERMISSIONS.AUDIT_VIEW),
  auditController.getById
);

export default router;