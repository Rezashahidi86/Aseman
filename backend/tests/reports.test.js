import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../models/SalesStats.js', () => ({
    default: {
        aggregate: vi.fn(),
        findOne: vi.fn(),
    },
}));

import SalesStats from '../models/SalesStats.js';
import {
  getDailyBranchReport,
  getWeeklyBranchReport,
  getMonthlyBranchReport,
} from '../services/reportsService.js';
import setBranchContext from '../middlewares/branchMiddleware.js';

describe('REP-009: Report date boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should include the start and end dates in a weekly report', async () => {
    SalesStats.aggregate.mockResolvedValue([]);

    await getWeeklyBranchReport({
      branchId: '507f1f77bcf86cd799439011',
      startDate: '2026-01-26',
      endDate: '2026-02-01',
    });

    const pipeline = SalesStats.aggregate.mock.calls[0][0];
    const matchStage = pipeline.find((stage) => stage.$match);

    expect(matchStage.$match.periodKey).toEqual({
      $gte: '2026-01-26',
      $lte: '2026-02-01',
    });
  });

  it('should return the report for the first day of a new month', async () => {
    SalesStats.findOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        totalSales: 1500,
        totalProfit: 300,
        totalItemsSold: 5,
        salesCount: 2,
      }),
    });

    const report = await getDailyBranchReport({
      branchId: '507f1f77bcf86cd799439011',
      date: '2026-02-01',
    });

    expect(SalesStats.findOne).toHaveBeenCalledWith({
      branch: '507f1f77bcf86cd799439011',
      periodType: 'daily',
      periodKey: '2026-02-01',
    });

    expect(report.date).toBe('2026-02-01');
    expect(report.totalSales).toBe(1500);
  });

  it('should query the correct month when the year changes', async () => {
    SalesStats.findOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    const report = await getMonthlyBranchReport({
      branchId: '507f1f77bcf86cd799439011',
      month: '2027-01',
    });

    expect(SalesStats.findOne).toHaveBeenCalledWith({
      branch: '507f1f77bcf86cd799439011',
      periodType: 'monthly',
      periodKey: '2027-01',
    });

    expect(report.totalSales).toBe(0);
  });
});

describe('REP-010: Report branch access', () => {
  it('should deny a seller access to another branch report', () => {
    const req = {
      user: {
        role: 'SELLER',
        branch: '507f1f77bcf86cd799439011',
      },
      params: {
        id: '507f1f77bcf86cd799439012',
      },
      body: {},
    };

    const next = vi.fn();

    setBranchContext(req, {}, next);

    expect(next).toHaveBeenCalledOnce();

    const error = next.mock.calls[0][0];

    expect(error).toBeDefined();
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Access denied to this branch');
  });

  it('should allow a seller to access their own branch report', () => {
    const req = {
      user: {
        role: 'SELLER',
        branch: '507f1f77bcf86cd799439011',
      },
      params: {
        id: '507f1f77bcf86cd799439011',
      },
      body: {},
    };

    const next = vi.fn();

    setBranchContext(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.branchId).toBe('507f1f77bcf86cd799439011');
  });
});
