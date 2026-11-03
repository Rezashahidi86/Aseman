import { beforeEach, describe, expect, it, vi } from 'vitest';
import { registerSale } from '../services/salesService.js';
import { getTehranJalaliMonthKey } from '../utils/dateKeys.js';

const mocks = vi.hoisted(() => ({
  startSession: vi.fn(),
  isValidObjectId: vi.fn(),
  productFind: vi.fn(),
  productUpdateOne: vi.fn(),
  productExists: vi.fn(),
  saleFindOne: vi.fn(),
  saleCreate: vi.fn(),
  statsUpdateOne: vi.fn(),
  auditCreate: vi.fn(),
}));

vi.mock('mongoose', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    default: {
      ...actual.default,
      Types: actual.default.Types,
      isValidObjectId: mocks.isValidObjectId,
      startSession: mocks.startSession,
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

vi.mock('../services/auditLogService.js', () => ({
  createAuditLog: mocks.auditCreate,
}));

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

    mocks.saleFindOne.mockImplementation(() => ({
      select: vi.fn().mockResolvedValue(null),
    }));

    mocks.saleCreate.mockImplementation(async ([data]) => [
      {
        ...data,
        _id: '507f1f77bcf86cd799439014',
        createdAt: new Date(),
      },
    ]);

    mocks.statsUpdateOne.mockResolvedValue({ acknowledged: true });
    mocks.auditCreate.mockResolvedValue({});
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
    expect(result.sale.items[0]).toEqual(
      expect.objectContaining({
        purchasePrice: 60,
        finalSalePrice: 120,
        lineTotal: 240,
        lineProfit: 120,
      }),
    );
    expect(stock).toBe(8);
    expect(salesCount).toBe(2);
    expect(mocks.statsUpdateOne).toHaveBeenCalledTimes(2);
    expect(mocks.statsUpdateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        branch: branchId,
        periodType: 'monthly',
        periodKey: getTehranJalaliMonthKey(),
      }),
      expect.objectContaining({
        $inc: expect.objectContaining({ totalSales: 240, totalProfit: 120 }),
      }),
      expect.objectContaining({ upsert: true, session: expect.anything() }),
    );
    expect(mocks.auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CREATE',
        resource: 'SALE',
        session: expect.anything(),
      }),
    );
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

  it('does not commit a sale when its audit record cannot be saved', async () => {
    mocks.auditCreate.mockRejectedValueOnce(
      new Error('Audit storage unavailable'),
    );

    await expect(
      registerSale({
        items,
        branchId,
        sellerId,
        idempotencyKey,
      }),
    ).rejects.toThrow('Audit storage unavailable');

    expect(mocks.saleCreate).toHaveBeenCalledTimes(1);
    expect(transactionCommitted).toBe(false);
  });

  it('SALE-020: returns an existing sale for a repeated request', async () => {
    const existingSale = {
      _id: '507f1f77bcf86cd799439014',
      branch: branchId,
      createdBy: sellerId,
      totalSales: 240,
      totalProfit: 120,
    };

    mocks.saleFindOne.mockReturnValue({
      select: vi.fn().mockResolvedValue(existingSale),
    });

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
    expect(mocks.auditCreate).not.toHaveBeenCalled();
  });

  it('SALE-021: rejects a final sale price below the product sale price', async () => {
    await expect(
      registerSale({
        items: [{ ...items[0], finalSalePrice: 99 }],
        branchId,
        sellerId,
        idempotencyKey,
      }),
    ).rejects.toThrow('cannot be lower than the current product sale price');

    expect(mocks.productUpdateOne).not.toHaveBeenCalled();
    expect(mocks.saleCreate).not.toHaveBeenCalled();
    expect(transactionCommitted).toBe(false);
  });

  it('SALE-022: rejects products that do not belong to the selected branch', async () => {
    mocks.productFind.mockReturnValue({
      session: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([]),
    });

    await expect(
      registerSale({
        items,
        branchId,
        sellerId,
        idempotencyKey,
      }),
    ).rejects.toThrow(
      'One or more products were not found in the current branch',
    );

    expect(mocks.productUpdateOne).not.toHaveBeenCalled();
    expect(mocks.saleCreate).not.toHaveBeenCalled();
    expect(transactionCommitted).toBe(false);
  });

  it('SALE-023: aggregates quantities when the same product appears more than once in the cart', async () => {
    const repeatedProductItems = [
      { productId, quantity: 2, finalSalePrice: 120 },
      { productId, quantity: 3, finalSalePrice: 130 },
    ];

    const result = await registerSale({
      items: repeatedProductItems,
      branchId,
      sellerId,
      idempotencyKey,
    });

    expect(result.sale.totalSales).toBe(630);
    expect(result.sale.totalProfit).toBe(330);
    expect(result.sale.totalItemsSold).toBe(5);
    expect(result.sale.items).toHaveLength(2);
    expect(mocks.productUpdateOne).toHaveBeenCalledTimes(1);
    expect(mocks.productUpdateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: productId,
        branch: branchId,
        quantity: { $gte: 5 },
      }),
      {
        $inc: {
          quantity: -5,
          salesCount: 5,
        },
      },
      expect.objectContaining({ session: expect.anything() }),
    );
    expect(stock).toBe(5);
    expect(salesCount).toBe(5);
  });

  it('SALE-024: rejects an idempotency key already used by another branch or seller', async () => {
    mocks.saleFindOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439014',
        branch: '507f1f77bcf86cd799439099',
        createdBy: sellerId,
      }),
    });

    await expect(
      registerSale({
        items,
        branchId,
        sellerId,
        idempotencyKey,
      }),
    ).rejects.toThrow('Idempotency key has already been used');

    expect(mocks.startSession).not.toHaveBeenCalled();
    expect(mocks.productUpdateOne).not.toHaveBeenCalled();
    expect(mocks.saleCreate).not.toHaveBeenCalled();
  });

  it('SALE-025: rejects duplicate cart lines when their combined quantity exceeds stock', async () => {
    stock = 4;

    await expect(
      registerSale({
        items: [
          { productId, quantity: 2, finalSalePrice: 120 },
          { productId, quantity: 3, finalSalePrice: 120 },
        ],
        branchId,
        sellerId,
        idempotencyKey,
      }),
    ).rejects.toThrow('Insufficient product stock');

    expect(mocks.productUpdateOne).toHaveBeenCalledWith(
      expect.objectContaining({ quantity: { $gte: 5 } }),
      expect.anything(),
      expect.anything(),
    );
    expect(mocks.saleCreate).not.toHaveBeenCalled();
    expect(mocks.statsUpdateOne).not.toHaveBeenCalled();
    expect(transactionCommitted).toBe(false);
  });

  it('SALE-026: stores the purchase price and the final basket sale price per line', async () => {
    const result = await registerSale({
      items: [{ productId, quantity: 3, finalSalePrice: 150 }],
      branchId,
      sellerId,
      idempotencyKey,
    });

    expect(result.sale.items[0]).toEqual(
      expect.objectContaining({
        purchasePrice: 60,
        finalSalePrice: 150,
        lineTotal: 450,
        lineProfit: 270,
      }),
    );
    expect(result.sale.totalSales).toBe(450);
    expect(result.sale.totalProfit).toBe(270);
  });

  it('SALE-027: rejects a product missing from the selected branch during the atomic stock update', async () => {
    mocks.productExists.mockReturnValue({
      session: vi.fn().mockResolvedValue(null),
    });
    mocks.productUpdateOne.mockResolvedValue({ matchedCount: 0 });

    await expect(
      registerSale({
        items,
        branchId,
        sellerId,
        idempotencyKey,
      }),
    ).rejects.toThrow('Product not found in the current branch');

    expect(mocks.saleCreate).not.toHaveBeenCalled();
    expect(mocks.statsUpdateOne).not.toHaveBeenCalled();
    expect(transactionCommitted).toBe(false);
  });

  it('SALE-028: rejects an idempotency key already used by a different seller', async () => {
    mocks.saleFindOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439014',
        branch: branchId,
        createdBy: '507f1f77bcf86cd799439099',
      }),
    });

    await expect(
      registerSale({
        items,
        branchId,
        sellerId,
        idempotencyKey,
      }),
    ).rejects.toThrow('Idempotency key has already been used');

    expect(mocks.startSession).not.toHaveBeenCalled();
    expect(mocks.productUpdateOne).not.toHaveBeenCalled();
    expect(mocks.saleCreate).not.toHaveBeenCalled();
  });

  it('SALE-029: rejects reuse of an idempotency key with different cart contents', async () => {
    mocks.saleFindOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439014',
        branch: branchId,
        createdBy: sellerId,
        requestHash: 'different-request-hash',
      }),
    });

    await expect(
      registerSale({
        items,
        branchId,
        sellerId,
        idempotencyKey,
      }),
    ).rejects.toThrow(
      'Idempotency key has already been used for a different sale',
    );

    expect(mocks.startSession).not.toHaveBeenCalled();
    expect(mocks.productUpdateOne).not.toHaveBeenCalled();
    expect(mocks.saleCreate).not.toHaveBeenCalled();
  });
});
