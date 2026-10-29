import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/reportsService.js', () => ({
  getDailyBranchReport: vi.fn(),
  getMonthlyBranchReport: vi.fn(),
  getAllBranchesReport: vi.fn(),
  getAllBranchesDailyReport: vi.fn(),
}));

import {
  getDailyBranchReport,
  getMonthlyBranchReport,
  getAllBranchesReport,
  getAllBranchesDailyReport,
} from '../services/reportsService.js';
import { getDashboardSummary } from '../controllers/dashboardController.js';

describe('Dashboard summary access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns only the resolved branch summary for a seller', async () => {
    getDailyBranchReport.mockResolvedValue({ totalSales: 100 });
    getMonthlyBranchReport.mockResolvedValue({ totalSales: 500 });

    const req = {
      user: { role: 'SELLER' },
      branchId: '507f1f77bcf86cd799439011',
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    await getDashboardSummary(req, res, next);

    expect(getDailyBranchReport).toHaveBeenCalledWith({
      branchId: req.branchId,
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    });
    expect(getMonthlyBranchReport).toHaveBeenCalledWith({
      branchId: req.branchId,
      month: expect.stringMatching(/^\d{4}-\d{2}$/),
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data.dashboard.scope).toBe('branch');
    expect(next).not.toHaveBeenCalled();
    expect(getAllBranchesReport).not.toHaveBeenCalled();
  });

  it('returns an all-branches summary for an admin without a selected branch', async () => {
    getAllBranchesReport.mockResolvedValue({ totals: { totalSales: 500 } });
    getAllBranchesDailyReport.mockResolvedValue({ reports: [] });

    const req = {
      user: { role: 'ADMIN' },
      branchId: null,
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    await getDashboardSummary(req, res, next);

    expect(getAllBranchesReport).toHaveBeenCalledOnce();
    expect(getAllBranchesDailyReport).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data.dashboard.scope).toBe('all-branches');
    expect(next).not.toHaveBeenCalled();
  });
});
