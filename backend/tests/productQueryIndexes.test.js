import { beforeEach, describe, expect, it, vi } from 'vitest';

const productMocks = vi.hoisted(() => ({
  find: vi.fn(),
  countDocuments: vi.fn(),
}));

vi.mock('../models/Product.js', () => ({
  default: {
    find: productMocks.find,
    countDocuments: productMocks.countDocuments,
  },
}));

import { getProducts } from '../controllers/productController.js';

describe('Product query index compatibility', () => {
  const branchId = '507f1f77bcf86cd799439011';
  let query;
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    query = {
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([]),
    };

    productMocks.find.mockReturnValue(query);
    productMocks.countDocuments.mockResolvedValue(0);

    req = {
      query: { barcode: '2030' },
      user: {
        role: 'SELLER',
        branch: branchId,
      },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    next = vi.fn();
  });

  it('includes the string type predicate for the partial barcode index', async () => {
    await getProducts(req, res, next);

    expect(productMocks.find).toHaveBeenCalledWith({
      branch: branchId,
      barcode: {
        $eq: '2030',
        $type: 'string',
      },
    });
    expect(productMocks.countDocuments).toHaveBeenCalledWith({
      branch: branchId,
      barcode: {
        $eq: '2030',
        $type: 'string',
      },
    });
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
