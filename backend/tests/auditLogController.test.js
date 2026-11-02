import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuditLogs } from '../controllers/auditLogController.js';

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  countDocuments: vi.fn(),
}));

vi.mock('../models/AuditLog.js', () => ({
  default: {
    find: mocks.find,
    countDocuments: mocks.countDocuments,
  },
  AUDIT_ACTIONS: ['CREATE', 'UPDATE', 'DELETE'],
  AUDIT_RESOURCES: ['PRODUCT', 'SALE', 'CUSTOMER', 'USER', 'BRANCH'],
}));

describe('Audit log controller', () => {
  let req;
  let res;
  let next;
  let query;

  beforeEach(() => {
    vi.clearAllMocks();

    req = { query: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();

    query = {
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([{ action: 'CREATE' }]),
    };

    mocks.find.mockReturnValue(query);
    mocks.countDocuments.mockResolvedValue(1);
  });

  it('returns paginated audit records and applies supported filters', async () => {
    req.query = {
      page: '2',
      limit: '10',
      action: 'UPDATE',
      resource: 'PRODUCT',
      actor: '507f1f77bcf86cd799439011',
      branch: '507f1f77bcf86cd799439012',
    };

    await getAuditLogs(req, res, next);

    expect(mocks.find).toHaveBeenCalledWith({
      action: 'UPDATE',
      resource: 'PRODUCT',
      actor: '507f1f77bcf86cd799439011',
      branch: '507f1f77bcf86cd799439012',
    });
    expect(query.skip).toHaveBeenCalledWith(10);
    expect(query.limit).toHaveBeenCalledWith(10);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        results: 1,
        pagination: expect.objectContaining({
          page: 2,
          limit: 10,
          total: 1,
        }),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects invalid pagination parameters', async () => {
    req.query.limit = '1000';

    await getAuditLogs(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400 }),
    );
    expect(mocks.find).not.toHaveBeenCalled();
  });

  it('rejects invalid actor identifiers', async () => {
    req.query.actor = 'not-an-object-id';

    await getAuditLogs(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400 }),
    );
    expect(mocks.find).not.toHaveBeenCalled();
  });
});
