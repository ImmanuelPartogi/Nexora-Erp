import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { comparePassword } from '../utils/password';
import { signAdminToken } from '../utils/jwt';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

/**
 * @route   POST /api/v1/auth/login
 * @desc    Admin User login
 * @access  Public
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    if (!admin.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      });
      return;
    }

    const isPasswordValid = await comparePassword(password, admin.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Update lastLoginAt
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const token = signAdminToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });

    const { passwordHash: _, ...adminWithoutPassword } = admin;

    res.json({
      success: true,
      data: {
        token,
        admin: adminWithoutPassword,
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
 * @route   GET /api/v1/auth/me
 * @desc    Get current logged in admin user
 * @access  Private (Admin Auth required)
 */
router.get('/me', requireAuth, (req: Request, res: Response): void => {
  res.json({
    success: true,
    data: {
      admin: req.admin,
    },
  });
});

export default router;
