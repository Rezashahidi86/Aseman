import { describe, it, expect } from 'vitest';
import {
  createProductSchema,
  updateProductSchema,
} from '../validators/productValidators.js';

describe('Product validators', () => {
  const validProduct = {
    name: 'Test Product',
    barcode: '123456789',
    purchasePrice: 100,
    salePrice: 150,
    quantity: 10,
    minimumStock: 3,
  };

  it('should accept valid product data', () => {
    expect(createProductSchema.safeParse(validProduct).success).toBe(true);
  });

  it('should accept product data without a barcode', () => {
    const product = { ...validProduct };
    delete product.barcode;

    expect(createProductSchema.safeParse(product).success).toBe(true);
  });

  it('should accept an empty barcode as omitted', () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      barcode: '  ',
    });

    expect(result.success).toBe(true);
    expect(result.data.barcode).toBeUndefined();
  });

  it('should accept barcode values without checking database uniqueness', () => {
    expect(createProductSchema.safeParse(validProduct).success).toBe(true);
  });

  it.each([
    ['purchasePrice', -1],
    ['salePrice', -1],
    ['quantity', -1],
    ['minimumStock', -1],
  ])('should reject negative %s on create', (field, value) => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      [field]: value,
    });

    expect(result.success).toBe(false);
  });

  it.each([
    ['purchasePrice', -1],
    ['salePrice', -1],
    ['quantity', -1],
    ['minimumStock', -1],
  ])('should reject negative %s on update', (field, value) => {
    const result = updateProductSchema.safeParse({
      [field]: value,
    });

    expect(result.success).toBe(false);
  });

  it('should allow clearing a barcode during update', () => {
    const result = updateProductSchema.safeParse({ barcode: '' });

    expect(result.success).toBe(true);
    expect(result.data.barcode).toBeUndefined();
  });

  it('should reject fractional quantity', () => {
    expect(
      createProductSchema.safeParse({
        ...validProduct,
        quantity: 1.5,
      }).success,
    ).toBe(false);
  });

  it('should reject fractional minimumStock', () => {
    expect(
      createProductSchema.safeParse({
        ...validProduct,
        minimumStock: 1.5,
      }).success,
    ).toBe(false);
  });

  it('should reject empty update data', () => {
    expect(updateProductSchema.safeParse({}).success).toBe(false);
  });
});
