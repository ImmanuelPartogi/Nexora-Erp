import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoleService } from '../role.service';
import { createRoleSchema, updateRoleSchema } from '../role.validation';
import { prisma } from '../../../../shared/db/prisma';

vi.mock('../../../../shared/db/prisma', () => ({
  prisma: {
    role: {
      findFirst: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
    permission: {
      findMany: vi.fn(),
    },
    companyUser: {
      count: vi.fn(),
    },
  },
}));

describe('Role Module - API & Validation Integration Tests', () => {
  let roleService: RoleService;

  beforeEach(() => {
    vi.resetAllMocks();
    roleService = new RoleService();
  });

  describe('Zod Schema Validation (createRoleSchema & updateRoleSchema)', () => {
    it('should REJECT creating role with name "Owner"', () => {
      const result = createRoleSchema.safeParse({
        name: 'Owner',
        permissions: ['customers.view'],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('reserved for system owner role');
      }
    });

    it('should REJECT creating role with lowercase "owner" and trimmed spaces "  Owner  "', () => {
      const resultLower = createRoleSchema.safeParse({
        name: 'owner',
        permissions: ['customers.view'],
      });
      expect(resultLower.success).toBe(false);

      const resultSpaced = createRoleSchema.safeParse({
        name: '  Owner  ',
        permissions: ['customers.view'],
      });
      expect(resultSpaced.success).toBe(false);
    });

    it('should ACCEPT valid custom role names like "Finance Manager"', () => {
      const result = createRoleSchema.safeParse({
        name: 'Finance Manager',
        permissions: ['finance.view'],
      });

      expect(result.success).toBe(true);
    });

    it('should REJECT updating role name to "Owner"', () => {
      const result = updateRoleSchema.safeParse({
        name: 'owner',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('RoleService.create', () => {
    it('should THROW ConflictError if trying to create a role named "Owner"', async () => {
      await expect(
        roleService.create(
          { name: 'Owner', permissions: ['customers.view'] },
          'company-1',
          'user-1'
        )
      ).rejects.toThrow('Role name "Owner" is reserved for system owner role');
    });

    it('should ALWAYS force isSystemOwner: false for custom created roles', async () => {
      vi.mocked(prisma.role.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.permission.findMany).mockResolvedValue([
        { id: 'perm-1', code: 'customers.view' } as any,
      ]);
      vi.mocked(prisma.role.create).mockResolvedValue({
        id: 'role-new',
        name: 'Custom Manager',
        companyId: 'company-1',
        isSystemOwner: false,
        isDefault: false,
        rolePermissions: [{ permission: { code: 'customers.view' } }],
      } as any);

      const created = await roleService.create(
        { name: 'Custom Manager', permissions: ['customers.view'] },
        'company-1',
        'user-1'
      );

      expect(prisma.role.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isSystemOwner: false,
          }),
        })
      );
      expect(created.isSystemOwner).toBe(false);
    });
  });

  describe('RoleService.delete', () => {
    it('should PREVENT deleting a role with isSystemOwner: true', async () => {
      vi.mocked(prisma.role.findFirst).mockResolvedValue({
        id: 'role-owner-1',
        name: 'Owner',
        companyId: 'company-1',
        isSystemOwner: true,
        rolePermissions: [],
      } as any);

      await expect(
        roleService.delete('role-owner-1', 'company-1')
      ).rejects.toThrow('Cannot delete System Owner role');
    });
  });
});
