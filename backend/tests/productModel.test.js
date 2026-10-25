import { describe, expect, it } from 'vitest';
import Product from '../models/Product.js';

describe('Product model', () => {
  const validProduct = {
    name: 'Test Product',
    barcode: '123456789',
    purchasePrice: 100,
    salePrice: 150,
    quantity: 10,
    branch: '507f1f77bcf86cd799439011',
  };

  it('should reject a product without required fields', async () => {
    await expect(new Product({}).validate()).rejects.toThrow();
  });

  it('should accept valid product data and default minimumStock to zero', async () => {
    const product = new Product(validProduct);

    await expect(product.validate()).resolves.toBeUndefined();
    expect(product.minimumStock).toBe(0);
    expect(product.salesCount).toBe(0);
  });

  it.each([
    ['purchasePrice', -1],
    ['salePrice', -1],
    ['quantity', -1],
    ['minimumStock', -1],
    ['salesCount', -1],
  ])('should reject negative %s', async (field, value) => {
    const product = new Product({ ...validProduct, [field]: value });

    await expect(product.validate()).rejects.toThrow();
  });

  it('should reject fractional quantity', async () => {
    const product = new Product({ ...validProduct, quantity: 1.5 });

    await expect(product.validate()).rejects.toThrow();
  });

  it('should reject fractional minimumStock', async () => {
    const product = new Product({ ...validProduct, minimumStock: 1.5 });

    await expect(product.validate()).rejects.toThrow();
  });

  it('should define a unique compound index for barcode within each branch', () => {
    const index = Product.schema.indexes().find(([fields, options]) => (
      fields.branch === 1 &&
      fields.barcode === 1 &&
      options.unique === true
    ));

    expect(index).toBeDefined();
  });

  it('should not require product names to be unique within a branch', () => {
    const index = Product.schema.indexes().find(([fields, options]) => (
      fields.branch === 1 &&
      fields.name === 1 &&
      options.unique === true
    ));

    expect(index).toBeUndefined();
  });

  it('should reference the Branch model', () => {
    expect(Product.schema.path('branch').options.ref).toBe('Branch');
    expect(Product.schema.path('branch').instance).toBe('ObjectId');
  });
});
