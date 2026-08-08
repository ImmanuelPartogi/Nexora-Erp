import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// Protect all analytics routes: SUPERADMIN only
router.use(requireAuth);
router.use(requireRole('SUPERADMIN'));

const getTenantBackendUrl = (): string => {
  return process.env.TENANT_BACKEND_URL || 'http://localhost:5000';
};

const getInternalSecret = (): string => {
  return process.env.INTERNAL_API_KEY || '';
};

/**
 * @route   GET /api/v1/analytics/api-usage
 * @desc    Get top called API endpoints and average response times
 * @access  Private (SUPERADMIN only)
 */
router.get('/api-usage', async (_req: Request, res: Response): Promise<void> => {
  try {
    const tenantBackendUrl = getTenantBackendUrl();
    const internalSecret = getInternalSecret();

    const response = await fetch(`${tenantBackendUrl}/api/v1/internal/analytics/api-usage`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': internalSecret,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).json({
        success: false,
        message: `Failed to fetch API usage analytics from tenant backend: ${errorText}`,
      });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error connecting to tenant backend',
    });
  }
});

/**
 * @route   GET /api/v1/analytics/errors
 * @desc    Get recent 500+ server error requests with tenantId & timestamp
 * @access  Private (SUPERADMIN only)
 */
router.get('/errors', async (_req: Request, res: Response): Promise<void> => {
  try {
    const tenantBackendUrl = getTenantBackendUrl();
    const internalSecret = getInternalSecret();

    const response = await fetch(`${tenantBackendUrl}/api/v1/internal/analytics/errors`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': internalSecret,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).json({
        success: false,
        message: `Failed to fetch error logs from tenant backend: ${errorText}`,
      });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error connecting to tenant backend',
    });
  }
});

export default router;
