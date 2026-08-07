// ============================================
// FILE: backend/src/modules/core/code/code.routes.ts
// Code Configuration Routes
// ============================================

import { Router } from 'express';
import { CodeController } from './code.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { requireCompany } from '../../../shared/middleware/tenant.middleware';
import { authorize } from '../../../shared/middleware/permission.middleware';

const router = Router();
const controller = new CodeController();

// Apply authentication and company middleware to all routes
router.use(authenticate);
router.use(requireCompany);

// Permission middleware for different operations
const canView = authorize('core.code.view');
const canManage = authorize('core.code.manage');

// GET /api/v1/code-config - List all code configurations
router.get('/', canView, controller.list.bind(controller));

// GET /api/v1/code-config/:id - Get specific code configuration
router.get('/:id', canView, controller.getById.bind(controller));

// POST /api/v1/code-config - Create new code configuration
router.post('/', canManage, controller.create.bind(controller));

// PUT /api/v1/code-config/:id - Update code configuration
router.put('/:id', canManage, controller.update.bind(controller));

// DELETE /api/v1/code-config/:id - Delete code configuration (soft delete)
router.delete('/:id', canManage, controller.delete.bind(controller));

// POST /api/v1/code-config/:id/reset - Reset counter for entity
router.post('/:id/reset', canManage, controller.resetCounter.bind(controller));

// POST /api/v1/code-config/generate - Generate next code for entity
router.post('/generate', canView, controller.generateCode.bind(controller));

export default router;