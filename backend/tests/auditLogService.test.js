import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
}));

vi.mock('../models/AuditLog.js', () => ({
  default: {
    create: mocks.create,
  },
}));

import { createAuditLog, pickSnapshot } from '../services/auditLogService.js';

describe('Audit log service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.create.mockImplementation(async ([data]) => [data]);
  });

  it('stores only allowlisted user fields and never stores credentials or email', async () => {
    const snapshot = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Seller',
      email: 'seller@example.com',
      role: 'SELLER',
      branch: '507f1f77bcf86cd799439012',
      isActive: true,
      password: 'plain-password',
      passwordHash: 'hashed-password',
      otp: '1234',
      token: 'secret-token',
    };

    expect(pickSnapshot('USER', snapshot)).toEqual({
      name: 'Seller',
      role: 'SELLER',
      branch: '507f1f77bcf86cd799439012',
      isActive: true,
    });
  });

  it('stores actor, branch, request metadata and safe before/after snapshots', async () => {
    const req = {
      user: {
        _id: '507f1f77bcf86cd799439011',
        role: 'SELLER',
        branch: '507f1f77bcf86cd799439012',
      },
      branchId: '507f1f77bcf86cd799439012',
      method: 'PATCH',
      path: '/api/v1/products/507f1f77bcf86cd799439013',
      ip: '127.0.0.1',
      get: (header) => ({
        'x-request-id': 'request-123',
        'user-agent': 'Vitest',
      })[header],
    };

    await createAuditLog({
      req,
      action: 'UPDATE',
      resource: 'PRODUCT',
      resourceId: '507f1f77bcf86cd799439013',
      before: { name: 'Old name', quantity: 8, passwordHash: 'secret' },
      after: { name: 'New name', quantity: 5, quantityExtra: 100 },
    });

    const [data] = mocks.create.mock.calls[0][0];

    expect(data.actor).toBe(req.user._id);
    expect(data.actorRole).toBe('SELLER');
    expect(data.branch).toBe(req.branchId);
    expect(data.request).toEqual({
      requestId: 'request-123',
      method: 'PATCH',
      path: req.path,
      ip: '127.0.0.1',
      userAgent: 'Vitest',
    });
    expect(data.changes).toEqual({
      before: { name: 'Old name', quantity: 8 },
      after: { name: 'New name', quantity: 5 },
    });
  });

  it('rejects audit records without an authenticated actor', async () => {
    await expect(
      createAuditLog({
        req: {},
        action: 'CREATE',
        resource: 'PRODUCT',
      }),
    ).rejects.toThrow('Authenticated actor is required for audit logging');

    expect(mocks.create).not.toHaveBeenCalled();
  });
});
