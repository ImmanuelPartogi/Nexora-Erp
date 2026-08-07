// ============================================
// FILE: backend/src/modules/core/auth/auth.routes.ts
// FIX: Use validateBody for body-only validation
// ============================================
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '../../../shared/middleware/validation.middleware';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { loginSchema, registerSchema } from './auth.validation';

const router = Router();
const authController = new AuthController();

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route   POST /api/v1/auth/login
 * @desc    User login
 * @access  Public
 */
router.post('/login', validateBody(loginSchema), authController.login);

/**
 * @route   POST /api/v1/auth/register
 * @desc    User registration
 * @access  Public
 */
router.post('/register', validateBody(registerSchema), authController.register);

// ============================================
// PROTECTED ROUTES
// ============================================

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (optional - for token blacklist)
 * @access  Private
 */
// router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public (with refresh token)
 */
// router.post('/refresh', authController.refreshToken);

export default router;