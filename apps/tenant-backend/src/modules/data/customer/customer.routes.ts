// ============================================
// FILE: backend/src/modules/data/customer/customer.routes.ts
// FIX: Use validateBody() instead of validate()
// ============================================
import { Router } from 'express';
import { CustomerController } from './customer.controller';
import { validateBody } from '../../../shared/middleware/validation.middleware';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { requireCompany } from '../../../shared/middleware/tenant.middleware';
import { authorize } from '../../../shared/middleware/permission.middleware';
import { auditLog } from '../../../shared/middleware/audit.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import {
  createCustomerSchema,
  updateCustomerSchema,
} from './customer.validation';

const router = Router();
const customerController = new CustomerController();

// ============================================
// MIDDLEWARE STACK (Applied to all routes)
// ============================================
router.use(authenticate);      // ✅ Step 1: Verify JWT & set req.user
router.use(requireCompany);    // ✅ Step 2: Verify company access & set req.activeCompanyId

// ============================================
// ROUTES
// ============================================

/**
 * @route   GET /api/v1/customers
 * @desc    List customers with pagination
 * @access  Private (requires customers.view permission)
 */
router.get(
  '/',
  authorize(PERMISSIONS.CUSTOMER_VIEW),
  customerController.list
);

/**
 * @route   GET /api/v1/customers/:id
 * @desc    Get customer by ID
 * @access  Private (requires customers.view permission)
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.CUSTOMER_VIEW),
  customerController.getById
);

/**
 * @route   POST /api/v1/customers
 * @desc    Create new customer
 * @access  Private (requires customers.create permission)
 */
router.post(
  '/',
  authorize(PERMISSIONS.CUSTOMER_CREATE),
  validateBody(createCustomerSchema), // ✅ FIXED: Use validateBody for body-only schema
  auditLog('data.customer', 'customer'),
  customerController.create
);

/**
 * @route   PUT /api/v1/customers/:id
 * @desc    Update customer
 * @access  Private (requires customers.edit permission)
 */
router.put(
  '/:id',
  authorize(PERMISSIONS.CUSTOMER_EDIT),
  validateBody(updateCustomerSchema), // ✅ FIXED: Use validateBody for body-only schema
  auditLog('data.customer', 'customer'),
  customerController.update
);

/**
 * @route   DELETE /api/v1/customers/:id
 * @desc    Delete customer (soft delete)
 * @access  Private (requires customers.delete permission)
 */
router.delete(
  '/:id',
  authorize(PERMISSIONS.CUSTOMER_DELETE),
  auditLog('data.customer', 'customer'),
  customerController.delete
);

export default router;