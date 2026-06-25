// ============================================
// FILE: backend/src/modules/reporting/report/report.routes.ts
// ============================================

import { Router } from 'express';
import { ReportController } from './report.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { requireCompany } from '../../../shared/middleware/tenant.middleware';
import { authorize } from '../../../shared/middleware/permission.middleware';
import { requireOwner } from '../../../shared/middleware/owner-only.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';

const router = Router();
const ctrl   = new ReportController();

router.use(authenticate);
router.use(requireCompany);

// GET  /api/v1/reports/dashboard          - dashboard stats
router.get('/dashboard', authorize(PERMISSIONS.REPORT_VIEW), ctrl.getDashboard);

// GET  /api/v1/reports/owner-dashboard    - comprehensive Owner-only analytics
router.get('/owner-dashboard', requireOwner, ctrl.getOwnerDashboard);

// GET  /api/v1/reports/entities           - semua entity + fields
router.get('/entities', authorize(PERMISSIONS.REPORT_VIEW), ctrl.getEntities);

// GET  /api/v1/reports/entities/:entity/fields  - fields 1 entity
router.get('/entities/:entity/fields', authorize(PERMISSIONS.REPORT_VIEW), ctrl.getEntityFields);

// POST /api/v1/reports/generate           - custom report
router.post('/generate', authorize(PERMISSIONS.REPORT_VIEW), ctrl.generateCustom);

// GET  /api/v1/reports                    - legacy
router.get('/', authorize(PERMISSIONS.REPORT_VIEW), ctrl.generate);

export default router;