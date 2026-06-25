// ============================================
// FILE: backend/src/modules/operations/transaction/transaction.routes.ts
// FIX: Add requireCompany + fix permission codes + use validateBody
// ============================================

import { Router } from 'express';
import { TransactionController } from './transaction.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { requireCompany } from '../../../shared/middleware/tenant.middleware'; // ✅ ADDED
import { authorize } from '../../../shared/middleware/permission.middleware';
import { validateBody } from '../../../shared/middleware/validation.middleware'; // ✅ FIXED
import { PERMISSIONS } from '../../../shared/constants/permissions'; // ✅ ADDED
import { createTransactionSchema, updateTransactionSchema } from './transaction.validation';

const router = Router();
const transactionController = new TransactionController();

// ============================================
// MIDDLEWARE STACK (Applied to all routes)
// ============================================
router.use(authenticate);      // ✅ Step 1: Verify JWT & set req.user
router.use(requireCompany);    // ✅ ADDED: Step 2: Verify company access & set req.activeCompanyId

// ============================================
// ROUTES
// ============================================

/**
 * @route   GET /api/v1/transactions/summary
 * @desc    Get transaction summary
 * @access  Private (requires transactions.view permission)
 */
router.get(
  '/summary',
  authorize(PERMISSIONS.TRANSACTION_VIEW), // ✅ FIXED: Use constant
  transactionController.getSummary
);

/**
 * @route   GET /api/v1/transactions
 * @desc    List transactions
 * @access  Private (requires transactions.view permission)
 */
router.get(
  '/',
  authorize(PERMISSIONS.TRANSACTION_VIEW), // ✅ FIXED: Use constant
  transactionController.list
);

/**
 * @route   GET /api/v1/transactions/:id
 * @desc    Get transaction by ID
 * @access  Private (requires transactions.view permission)
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.TRANSACTION_VIEW), // ✅ FIXED: Use constant
  transactionController.getById
);

/**
 * @route   POST /api/v1/transactions
 * @desc    Create transaction
 * @access  Private (requires transactions.create permission)
 */
router.post(
  '/',
  authorize(PERMISSIONS.TRANSACTION_CREATE), // ✅ FIXED: Use constant
  validateBody(createTransactionSchema), // ✅ FIXED: Use validateBody
  transactionController.create
);

/**
 * @route   PUT /api/v1/transactions/:id
 * @desc    Update transaction
 * @access  Private (requires transactions.edit permission)
 */
router.put(
  '/:id',
  authorize(PERMISSIONS.TRANSACTION_EDIT), // ✅ FIXED: Use constant
  validateBody(updateTransactionSchema), // ✅ FIXED: Use validateBody
  transactionController.update
);

/**
 * @route   POST /api/v1/transactions/:id/approve
 * @desc    Approve transaction
 * @access  Private (requires transactions.approve permission)
 */
router.post(
  '/:id/approve',
  authorize(PERMISSIONS.TRANSACTION_APPROVE), // ✅ FIXED: Use constant
  transactionController.approve
);

/**
 * @route   DELETE /api/v1/transactions/:id
 * @desc    Delete transaction (soft delete)
 * @access  Private (requires transactions.delete permission)
 */
router.delete(
  '/:id',
  authorize(PERMISSIONS.TRANSACTION_DELETE), // ✅ FIXED: Use constant
  transactionController.delete
);

export default router;