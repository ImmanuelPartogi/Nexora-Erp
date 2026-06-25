// ============================================
// FILE: backend/src/modules/data/employee/employee.routes.ts
// FIX: Use validateBody() for consistency
// ============================================
import { Router } from 'express';
import { EmployeeController } from './employee.controller';
import { validateBody, validateParams } from '../../../shared/middleware/validation.middleware';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { requireCompany } from '../../../shared/middleware/tenant.middleware';
import { authorize } from '../../../shared/middleware/permission.middleware';
import { auditLog } from '../../../shared/middleware/audit.middleware';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { createEmployeeSchema, updateEmployeeSchema } from './employee.validation';
import { z } from 'zod';

const router = Router();
const employeeController = new EmployeeController();

// ✅ Middleware stack
router.use(authenticate);
router.use(requireCompany);

// ✅ Param validation schema
const idParamSchema = z.object({
  id: z.string().uuid('Invalid employee ID format'),
});

/**
 * @route   GET /api/v1/employees
 * @desc    List employees with pagination
 * @access  Private (requires employee.view permission)
 */
router.get(
  '/',
  authorize(PERMISSIONS.EMPLOYEE_VIEW),
  employeeController.list
);

/**
 * @route   GET /api/v1/employees/:id
 * @desc    Get employee by ID
 * @access  Private (requires employee.view permission)
 */
router.get(
  '/:id',
  validateParams(idParamSchema),
  authorize(PERMISSIONS.EMPLOYEE_VIEW),
  employeeController.getById
);

/**
 * @route   POST /api/v1/employees
 * @desc    Create new employee
 * @access  Private (requires employee.create permission)
 */
router.post(
  '/',
  authorize(PERMISSIONS.EMPLOYEE_CREATE),
  validateBody(createEmployeeSchema), // ✅ FIXED: Use validateBody instead of validate
  auditLog('data.employee', 'employee'),
  employeeController.create
);

/**
 * @route   PUT /api/v1/employees/:id
 * @desc    Update employee
 * @access  Private (requires employee.edit permission)
 */
router.put(
  '/:id',
  validateParams(idParamSchema),
  authorize(PERMISSIONS.EMPLOYEE_EDIT),
  validateBody(updateEmployeeSchema), // ✅ FIXED: Use validateBody instead of validate
  auditLog('data.employee', 'employee'),
  employeeController.update
);

/**
 * @route   DELETE /api/v1/employees/:id
 * @desc    Delete employee (soft delete)
 * @access  Private (requires employee.delete permission)
 */
router.delete(
  '/:id',
  validateParams(idParamSchema),
  authorize(PERMISSIONS.EMPLOYEE_DELETE),
  auditLog('data.employee', 'employee'),
  employeeController.delete
);

export default router;