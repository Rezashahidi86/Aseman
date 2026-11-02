import mongoose from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SalesStats from '../models/SalesStats.js';
import Sale from '../models/Sale.js';
import Branch from '../models/Branch.js';
import {
  getDailyBranchReport,
  getWeeklyBranchReport,
  getMonthlyBranchReport,
  getMonthlyComparisonReport,
  getAllBranchesReport,
} from '../services/reportsService.js';
import setBranchContext from '../middlewares/branchMiddleware.js';
import {
  getTehranJalaliMonthKey,
  getJalaliMonthDateRange,
  getTehranDateRange,
} from '../utils/dateKeys.js';

vi.mock('../models/SalesStats.js', () => ({
  default: {
    aggregate: vi.fn(),
    findOne: vi.fn(),
  },
}));

vi.mock('../models/Sale.js', () => ({
  default: {
    aggregate: vi.fn(),
  },
}));

vi.mock('../models/Branch.js', () => ({
  default: {
    find: vi.fn(),
  },
}));

describe('REP-009: Daily, weekly and monthly report accuracy', () => {
  const branchId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    vi.clearAllMocks();
    SalesStats.aggregate.mockResolvedValue([]);
    Sale.aggregate.mockResolvedValue([]);
    SalesStats.findOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });
  });

  it('returns daily totals for the requested Tehran calendar date', async () => {
    SalesStats.findOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        totalSales: 1500,
        totalProfit: 300,
        totalItemsSold: 5,
        salesCount: 2,
      }),
    });

    const report = await getDailyBranchReport({
      branchId,
      date: '2026-02-01',
    });

    expect(SalesStats.findOne).toHaveBeenCalledWith({
      branch: branchId,
      periodType: 'daily',
      periodKey: '2026-02-01',
    });
    expect(report).toEqual(expect.objectContaining({
      date: '2026-02-01',
      totalSales: 1500,
      totalProfit: 300,
      totalItemsSold: 5,
      salesCount: 2,
    }));
  });

  it('returns zero totals when a daily report does not exist', async () => {
    const report = await getDailyBranchReport({ branchId, date: '2026-02-01' });

    expect(report).toEqual(expect.objectContaining({
      totalSales: 0,
      totalProfit: 0,
      totalItemsSold: 0,
      salesCount: 0,
    }));
  });

  it('includes both endpoints in a seven-day weekly report', async () => {
    SalesStats.aggregate.mockResolvedValue([{
      totalSales: 5000,
      totalProfit: 1200,
      totalItemsSold: 15,
      salesCount: 6,
    }]);

    const report = await getWeeklyBranchReport({
      branchId,
      startDate: '2026-01-26',
      endDate: '2026-02-01',
    });

    const matchStage = SalesStats.aggregate.mock.calls[0][0].find((stage) => stage.$match);

    expect(matchStage.$match.periodKey).toEqual({
      $gte: '2026-01-26',
      $lte: '2026-02-01',
    });
    expect(report).toEqual(expect.objectContaining({
      totalSales: 5000,
      totalProfit: 1200,
      totalItemsSold: 15,
      salesCount: 6,
    }));
  });

  it('rejects a weekly range that is not exactly seven days', async () => {
    await expect(getWeeklyBranchReport({
      branchId,
      startDate: '2026-01-26',
      endDate: '2026-02-02',
    })).rejects.toThrow();

    expect(SalesStats.aggregate).not.toHaveBeenCalled();
  });

  it('uses the Jalali month boundaries for monthly branch reports', async () => {
    Sale.aggregate.mockResolvedValue([{
      totalSales: 12000,
      totalProfit: 3200,
      totalItemsSold: 40,
      salesCount: 12,
    }]);

    const report = await getMonthlyBranchReport({ branchId, month: '1405-08' });
    const { startDate, endDate } = getJalaliMonthDateRange('1405-08');
    const { start, end } = getTehranDateRange(startDate, endDate);
    const matchStage = Sale.aggregate.mock.calls[0][0].find((stage) => stage.$match);

    expect(matchStage.$match).toEqual({
      branch: new mongoose.Types.ObjectId(branchId),
      createdAt: { $gte: start, $lte: end },
    });
    expect(report).toEqual(expect.objectContaining({
      month: '1405-08',
      startDate,
      endDate,
      totalSales: 12000,
      totalProfit: 3200,
      totalItemsSold: 40,
      salesCount: 12,
    }));
  });

  it('uses the current and previous Jalali months for monthly comparison', async () => {
    Sale.aggregate
      .mockResolvedValueOnce([{
        totalSales: 2000,
        totalProfit: 500,
        totalItemsSold: 8,
        salesCount: 3,
      }])
      .mockResolvedValueOnce([{
        totalSales: 1000,
        totalProfit: 200,
        totalItemsSold: 4,
        salesCount: 2,
      }]);

    const report = await getMonthlyComparisonReport({ branchId });
    const currentMonth = getTehranJalaliMonthKey();
    const [year, month] = currentMonth.split('-').map(Number);
    const previousMonth = month === 1
      ? `${year - 1}-12`
      : `${year}-${String(month - 1).padStart(2, '0')}`;

    expect(report.currentMonth.month).toBe(currentMonth);
    expect(report.previousMonth.month).toBe(previousMonth);
    expect(report.comparison.totalSales).toEqual({
      difference: 1000,
      percentage: 100,
    });
    expect(Sale.aggregate).toHaveBeenCalledTimes(2);
  });

  it('aggregates all-branch totals from sales within the current Jalali month', async () => {
    const branchA = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
    const branchB = new mongoose.Types.ObjectId('507f1f77bcf86cd799439012');
    Branch.find.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([
        { _id: branchA, name: 'Central', code: 'C', isActive: true },
        { _id: branchB, name: 'West', code: 'W', isActive: true },
      ]),
    });
    Sale.aggregate.mockResolvedValue([
      {
        _id: branchA,
        totalSales: 3000,
        totalProfit: 900,
        totalItemsSold: 10,
        salesCount: 4,
      },
      {
        _id: branchB,
        totalSales: 1000,
        totalProfit: 250,
        totalItemsSold: 3,
        salesCount: 2,
      },
    ]);

    const report = await getAllBranchesReport();
    const currentMonth = getTehranJalaliMonthKey();
    const { startDate, endDate } = getJalaliMonthDateRange(currentMonth);
    const { start, end } = getTehranDateRange(startDate, endDate);
    const matchStage = Sale.aggregate.mock.calls[0][0].find((stage) => stage.$match);

    expect(matchStage.$match.createdAt).toEqual({ $gte: start, $lte: end });
    expect(report.month).toBe(currentMonth);
    expect(report.totals).toEqual({
      totalSales: 4000,
      totalProfit: 1150,
      totalItemsSold: 13,
      salesCount: 6,
    });
  });
});

describe('REP-010: Report branch access', () => {
  it('denies a seller access to another branch report', () => {
    const req = {
      user: {
        role: 'SELLER',
        branch: '507f1f77bcf86cd799439011',
      },
      params: {
        branchId: '507f1f77bcf86cd799439012',
      },
      body: {},
    };

    const next = vi.fn();
    setBranchContext(req, {}, next);
    const error = next.mock.calls[0][0];

    expect(error).toBeDefined();
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Access denied to this branch');
  });

  it('allows a seller to access their own branch report', () => {
    const req = {
      user: {
        role: 'SELLER',
        branch: '507f1f77bcf86cd799439011',
      },
      params: {
        branchId: '507f1f77bcf86cd799439011',
      },
      body: {},
    };

    const next = vi.fn();
    setBranchContext(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.branchId).toBe('507f1f77bcf86cd799439011');
  });
});
