import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// Protect all tenant monitoring routes: SUPERADMIN only
router.use(requireAuth);
router.use(requireRole('SUPERADMIN'));

const getTenantBackendUrl = (): string => {
  return process.env.TENANT_BACKEND_URL || 'http://localhost:5000';
};

const getInternalSecret = (): string => {
  return process.env.INTERNAL_API_KEY || '';
};

/**
 * @route   GET /api/v1/tenants
 * @desc    Get list of all tenant companies + user counts (read-only monitoring)
 * @access  Private (SUPERADMIN only)
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const tenantBackendUrl = getTenantBackendUrl();
    const internalSecret = getInternalSecret();

    const response = await fetch(`${tenantBackendUrl}/api/v1/internal/tenants`, {
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
        message: `Failed to fetch tenant list from tenant backend: ${errorText}`,
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
 * @route   GET /api/v1/tenants/:id/stats
 * @desc    Get request count & error count for a specific tenant
 * @access  Private (SUPERADMIN only)
 */
router.get('/:id/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const tenantBackendUrl = getTenantBackendUrl();
    const internalSecret = getInternalSecret();

    const response = await fetch(`${tenantBackendUrl}/api/v1/internal/stats`, {
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
        message: `Failed to fetch stats from tenant backend: ${errorText}`,
      });
      return;
    }

    const result: any = await response.json();
    const tenantStats = result.data?.tenantStats || [];
    const specificStat = tenantStats.find((s: any) => s.tenantId === id) || {
      tenantId: id,
      requestCount: 0,
      errorCount: 0,
    };

    res.json({
      success: true,
      data: {
        tenantId: id,
        stats: specificStat,
        overallTotalRequests: result.data?.totalRequests || 0,
        overallTotalErrors: result.data?.totalErrors || 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error connecting to tenant backend',
    });
  }
});

export default router;
