import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteProduct,
  getProductById,
  updateProduct,
} from '../controllers/productController.js';
import Product from '../models/Product.js';
import ROLES from '../constants/roles.js';

vi.mock('../models/Product.js', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

vi.mock('../models/Branch.js', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

describe('Product branch isolation in controllers', () => {
  const ownBranchId = '507f1f77bcf86cd799439011';
  const anotherBranchId = '507f191e810c19729de860ea';
  const productId = '507f1f77bcf86cd799439012';

  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      user: {
        role: ROLES.SELLER,
        branch: ownBranchId,
      },
      params: { id: productId },
      query: {},
      body: { name: 'Updated product' },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    next = vi.fn();
    Product.findOne.mockResolvedValue(null);
  });

  it('does not return a product belonging to another branch', async () => {
    const query = {
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(null),
    };
    Product.findOne.mockReturnValue(query);

    await getProductById(req, res, next);

    expect(Product.findOne).toHaveBeenCalledWith({
      _id: productId,
      branch: ownBranchId,
    });
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404 }),
    );
    expect(res.json).not.toHaveBeenCalled();
  });

  it('does not update a product belonging to another branch', async () => {
    await updateProduct(req, res, next);

    expect(Product.findOne).toHaveBeenCalledWith({
      _id: productId,
      branch: ownBranchId,
    });
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404 }),
    );
    expect(res.json).not.toHaveBeenCalled();
  });

  it('does not delete a product belonging to another branch', async () => {
    await deleteProduct(req, res, next);

    expect(Product.findOne).toHaveBeenCalledWith({
      _id: productId,
      branch: ownBranchId,
    });
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404 }),
    );
    expect(res.json).not.toHaveBeenCalled();
  });

  it('does not allow a seller to choose another branch through query parameters', async () => {
    req.query.branchId = anotherBranchId;

    await updateProduct(req, res, next);

    expect(Product.findOne).toHaveBeenCalledWith({
      _id: productId,
      branch: ownBranchId,
    });
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404 }),
    );
  });
});
