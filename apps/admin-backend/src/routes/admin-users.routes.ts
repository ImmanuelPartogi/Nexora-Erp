import { Router, Request, Response } from 'express';
import { AdminRole } from '@prisma/client';
import { prisma } from '../db/prisma';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import { hashPassword } from '../utils/password';
import { generatePassword } from '../utils/generatePassword';

const router = Router();

// Protect all admin-users routes: Authentication & SUPERADMIN role required
router.use(requireAuth);
router.use(requireRole('SUPERADMIN'));

const VALID_ROLES = Object.values(AdminRole);

/**
 * Helper to validate email format
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * @route   GET /api/v1/admin-users
 * @desc    Get list of all admin users
 * @access  Private (SUPERADMIN only)
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { users },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
});

/**
 * @route   POST /api/v1/admin-users
 * @desc    Create a new admin user
 * @access  Private (SUPERADMIN only)
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: email, password, name, role',
      });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
      return;
    }

    if (!VALID_ROLES.includes(role as AdminRole)) {
      res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles: ${VALID_ROLES.join(', ')}`,
      });
      return;
    }

    const existingUser = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Admin user with this email already exists',
      });
      return;
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        name,
        role: role as AdminRole,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      success: true,
      data: { user: newUser },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
});

/**
 * @route   PATCH /api/v1/admin-users/:id
 * @desc    Update admin user (name, role, isActive)
 * @access  Private (SUPERADMIN only)
 */
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role, isActive } = req.body;

    const existingUser = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'Admin user not found',
      });
      return;
    }

    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'Name cannot be empty',
        });
        return;
      }
      updateData.name = name.trim();
    }

    if (role !== undefined) {
      if (!VALID_ROLES.includes(role as AdminRole)) {
        res.status(400).json({
          success: false,
          message: `Invalid role. Allowed roles: ${VALID_ROLES.join(', ')}`,
        });
        return;
      }
      updateData.role = role as AdminRole;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'isActive must be a boolean value',
        });
        return;
      }
      updateData.isActive = isActive;
    }

    const updatedUser = await prisma.adminUser.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: { user: updatedUser },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
});

/**
 * @route   POST /api/v1/admin-users/:id/reset-password
 * @desc    Reset admin user password to a newly generated random password
 * @access  Private (SUPERADMIN only)
 */
router.post('/:id/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existingUser = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'Admin user not found',
      });
      return;
    }

    const newPassword = generatePassword(16);
    const passwordHash = await hashPassword(newPassword);

    await prisma.adminUser.update({
      where: { id },
      data: { passwordHash },
    });

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        id: existingUser.id,
        email: existingUser.email,
        newPassword,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
});

/**
 * @route   DELETE /api/v1/admin-users/:id
 * @desc    Soft delete an admin user (set isActive: false)
 * @access  Private (SUPERADMIN only)
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.admin && req.admin.id === id) {
      res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own active superadmin account',
      });
      return;
    }

    const existingUser = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'Admin user not found',
      });
      return;
    }

    const updatedUser = await prisma.adminUser.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Admin user deactivated successfully (soft delete)',
      data: { user: updatedUser },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
});

export default router;
