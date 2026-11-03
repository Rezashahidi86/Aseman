import { describe, expect, it } from 'vitest';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import Customer from '../models/Customer.js';

const findIndex = (model, expectedKeys, name) =>
  model.schema
    .indexes()
    .find(([keys, options]) =>
      name
        ? options.name === name
        : JSON.stringify(keys) === JSON.stringify(expectedKeys),
    );

describe('Query optimization indexes', () => {
  it('preserves the unique partial barcode index and adds branch product sorting', () => {
    const barcodeIndex = findIndex(Product, null, 'unique_barcode_per_branch');
    const productSortIndex = findIndex(Product, null, 'branch_createdAt_desc');

    expect(barcodeIndex).toBeDefined();
    expect(barcodeIndex[0]).toEqual({ branch: 1, barcode: 1 });
    expect(barcodeIndex[1]).toMatchObject({
      unique: true,
      partialFilterExpression: { barcode: { $type: 'string' } },
    });
    expect(productSortIndex[0]).toEqual({ branch: 1, createdAt: -1 });
  });

  it('preserves branch/date sales queries and indexes seller report filters', () => {
    const branchDateIndex = findIndex(Sale, { branch: 1, createdAt: -1 });
    const sellerReportIndex = findIndex(
      Sale,
      null,
      'branch_createdBy_createdAt_desc',
    );

    expect(branchDateIndex).toBeDefined();
    expect(branchDateIndex[0]).toEqual({ branch: 1, createdAt: -1 });
    expect(sellerReportIndex[0]).toEqual({
      branch: 1,
      createdBy: 1,
      createdAt: -1,
    });
  });

  it('preserves customer name lookup and indexes branch pagination', () => {
    const customerNameIndex = findIndex(Customer, { branch: 1, name: 1 });
    const customerPaginationIndex = findIndex(
      Customer,
      null,
      'branch_createdAt_id_desc',
    );

    expect(customerNameIndex).toBeDefined();
    expect(customerPaginationIndex[0]).toEqual({
      branch: 1,
      createdAt: -1,
      _id: -1,
    });
  });
});
