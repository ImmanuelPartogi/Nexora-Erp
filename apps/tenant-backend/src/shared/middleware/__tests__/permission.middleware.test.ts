import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkPermission } from '../permission.middleware';
import { prisma } from '../../db/prisma';

vi.mock('../../db/prisma', () => ({
  prisma: {
    companyUser: {
      count: vi.fn(),
    },
    rolePermission: {
      count: vi.fn(),
    },
  },
}));

describe('Permission Middleware - checkPermission Unit Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('(a) should PASS all permission checks for user with role isSystemOwner: true (System Owner Bypass)', async () => {
    // Mock companyUser.count returns 1 when checking role: { isSystemOwner: true, deletedAt: null }
    vi.mocked(prisma.companyUser.count).mockResolvedValue(1);

    const result = await checkPermission('user-1', 'company-1', 'any.unassigned.permission');

    expect(result).toBe(true);
    expect(prisma.companyUser.count).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        companyId: 'company-1',
        isActive: true,
        role: { isSystemOwner: true, deletedAt: null },
      },
    });
    // Should NOT reach rolePermission table check
    expect(prisma.rolePermission.count).not.toHaveBeenCalled();
  });

  it('(b) REGRESSION TEST: should DENY access for user with role named "Owner" when isSystemOwner is false and no permission exists', async () => {
    // Mock companyUser.count returns 0 for isSystemOwner: true
    vi.mocked(prisma.companyUser.count).mockResolvedValue(0);
    // Mock rolePermission.count returns 0 (no explicit permission mapped)
    vi.mocked(prisma.rolePermission.count).mockResolvedValue(0);

    const result = await checkPermission('user-hacker', 'company-1', 'sensitive.finance.view');

    expect(result).toBe(false);
    expect(prisma.companyUser.count).toHaveBeenCalledWith({
      where: {
        userId: 'user-hacker',
        companyId: 'company-1',
        isActive: true,
        role: { isSystemOwner: true, deletedAt: null },
      },
    });
    // Must fall through to rolePermission check which returns 0
    expect(prisma.rolePermission.count).toHaveBeenCalled();
  });

  it('(c) should DENY access for regular user role without explicit permission', async () => {
    vi.mocked(prisma.companyUser.count).mockResolvedValue(0);
    vi.mocked(prisma.rolePermission.count).mockResolvedValue(0);

    const result = await checkPermission('user-staff', 'company-1', 'core.role.delete');

    expect(result).toBe(false);
  });

  it('(d) should PASS access for regular user role WITH explicit permission', async () => {
    vi.mocked(prisma.companyUser.count).mockResolvedValue(0);
    vi.mocked(prisma.rolePermission.count).mockResolvedValue(1);

    const result = await checkPermission('user-staff', 'company-1', 'customer.view');

    expect(result).toBe(true);
    expect(prisma.rolePermission.count).toHaveBeenCalledWith({
      where: {
        role: {
          companyUsers: {
            some: {
              userId: 'user-staff',
              companyId: 'company-1',
              isActive: true,
            },
          },
        },
        permission: {
          code: 'customer.view',
        },
      },
    });
  });
});
