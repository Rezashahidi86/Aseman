import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  startSession: vi.fn(),
  isValidObjectId: vi.fn(),
  productFind: vi.fn(),
  productUpdateOne: vi.fn(),
  productExists: vi.fn(),
  saleFindOne: vi.fn(),
  saleCreate: vi.fn(),
  statsUpdateOne: vi.fn(),
}));

vi.mock('mongoose', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    default: {
      ...actual.default,
      Types: actual.default.Types,
    },
  };
});

vi.mock('../models/Product.js', () => ({
  default: {
    find: mocks.productFind,
    updateOne: mocks.productUpdateOne,
    exists: mocks.productExists,
  },
}));

vi.mock('../models/Sale.js', () => ({
  default: {
    findOne: mocks.saleFindOne,
    create: mocks.saleCreate,
  },
}));

vi.mock('../models/SalesStats.js', () => ({
  default: {
    updateOne: mocks.statsUpdateOne,
  },
}));

import { registerSale } from '../services/salesService.js';

describe('Sales service', () => {
  const branchId = '507f1f77bcf86cd799439011';
  const sellerId = '507f1f77bcf86cd799439012';
  const productId = '507f1f77bcf86cd799439013';
  const idempotencyKey = 'sale-request-key-001';

  const product = {
    _id: productId,
    name: 'Test Product',
    barcode: '123456789',
    purchasePrice: 60,
    salePrice: 100,
    quantity: 10,
    salesCount: 0,
    branch: branchId,
  };

  const items = [
    {
      productId,
      quantity: 2,
      finalSalePrice: 120,
    },
  ];

  let stock;
  let salesCount;
  let transactionCommitted;

  beforeEach(() => {
    vi.clearAllMocks();

    stock = 10;
    salesCount = 0;
    transactionCommitted = false;

    mocks.isValidObjectId.mockReturnValue(true);

    mocks.startSession.mockResolvedValue({
      withTransaction: vi.fn(async (callback) => {
        await callback();
        transactionCommitted = true;
      }),
      endSession: vi.fn().mockResolvedValue(undefined),
    });

    const productsQuery = {
      session: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([product]),
    };

    mocks.productFind.mockReturnValue(productsQuery);

    mocks.productUpdateOne.mockImplementation(async (filter, update) => {
      if (stock < filter.quantity.$gte) {
        return { matchedCount: 0 };
      }

      stock += update.$inc.quantity;
      salesCount += update.$inc.salesCount;

      return { matchedCount: 1 };
    });

    mocks.productExists.mockReturnValue({
      session: vi.fn().mockResolvedValue(product),
    });

    mocks.saleFindOne.mockResolvedValue(null);

    mocks.saleCreate.mockImplementation(async ([data]) => [
      {
        ...data,
        _id: '507f1f77bcf86cd799439014',
        createdAt: new Date(),
      },
    ]);

    mocks.statsUpdateOne.mockResolvedValue({ acknowledged: true });
  });

  it('SALE-017: registers a sale, calculates profit and decreases stock', async () => {
    const result = await registerSale({
      items,
      branchId,
      sellerId,
      idempotencyKey,
    });

    expect(result.isDuplicate).toBe(false);
    expect(result.sale.totalSales).toBe(240);
    expect(result.sale.totalProfit).toBe(120);
    expect(result.sale.totalItemsSold).toBe(2);
    expect(stock).toBe(8);
    expect(salesCount).toBe(2);
    expect(mocks.statsUpdateOne).toHaveBeenCalledTimes(2);
    expect(transactionCommitted).toBe(true);
  });

  it('SALE-018: rejects a sale when stock is insufficient', async () => {
    stock = 1;

    await expect(
      registerSale({
        items,
        branchId,
        sellerId,
        idempotencyKey,
      }),
    ).rejects.toThrow('Insufficient product stock');

    expect(mocks.saleCreate).not.toHaveBeenCalled();
    expect(transactionCommitted).toBe(false);
  });

  it('SALE-019: rejects client-supplied financial fields', async () => {
    const manipulatedItems = [
      {
        ...items[0],
        purchasePrice: 1,
        lineTotal: 2,
        lineProfit: 100000,
      },
    ];

    await expect(
      registerSale({
        items: manipulatedItems,
        branchId,
        sellerId,
        idempotencyKey,
      }),
    ).rejects.toThrow();

    expect(mocks.productUpdateOne).not.toHaveBeenCalled();
    expect(mocks.saleCreate).not.toHaveBeenCalled();
  });

  it('SALE-020: returns an existing sale for a repeated request', async () => {
    const existingSale = {
      _id: '507f1f77bcf86cd799439014',
      branch: branchId,
      createdBy: sellerId,
      totalSales: 240,
      totalProfit: 120,
    };

    mocks.saleFindOne.mockResolvedValue(existingSale);

    const result = await registerSale({
      items,
      branchId,
      sellerId,
      idempotencyKey,
    });

    expect(result.isDuplicate).toBe(true);
    expect(result.sale).toBe(existingSale);
    expect(mocks.startSession).not.toHaveBeenCalled();
    expect(mocks.productUpdateOne).not.toHaveBeenCalled();
    expect(mocks.statsUpdateOne).not.toHaveBeenCalled();
  });
});
