import { describe, expect, it } from 'vitest';
import { selectBranchSchema } from '../validators/branchValidators.js';
import { productQuerySchema } from '../validators/productValidators.js';
import { customerQuerySchema } from '../validators/customerValidators.js';
import { needQuerySchema } from '../validators/needValidators.js';
import { manualDocumentListSchema } from '../validators/manualDocumentValidators.js';
import { referenceCatalogQuerySchema } from '../validators/referenceCatalogValidators.js';

describe('Request query validators', () => {
  it('accepts valid branch selection data', () => {
    expect(
      selectBranchSchema.safeParse({
        branchId: '507f1f77bcf86cd799439011',
      }).success,
    ).toBe(true);
  });

  it('rejects malformed branch selection data', () => {
    expect(
      selectBranchSchema.safeParse({ branchId: 'invalid' }).success,
    ).toBe(false);
  });

  it('accepts product filters and coerces pagination values', () => {
    const result = productQuerySchema.safeParse({
      page: '2',
      limit: '25',
      stock: 'low',
    });

    expect(result.success).toBe(true);
    expect(result.data.page).toBe(2);
    expect(result.data.limit).toBe(25);
  });

  it('rejects unsupported product query parameters', () => {
    expect(
      productQuerySchema.safeParse({ unexpected: 'value' }).success,
    ).toBe(false);
  });

  it('rejects malformed customer phone filters', () => {
    expect(customerQuerySchema.safeParse({ phone: '123' }).success).toBe(false);
  });

  it('rejects unsupported need status filters', () => {
    expect(needQuerySchema.safeParse({ status: 'DONE' }).success).toBe(false);
  });

  it('rejects manual document pagination above the maximum page size', () => {
    expect(
      manualDocumentListSchema.safeParse({ limit: '500' }).success,
    ).toBe(false);
  });

  it('rejects oversized reference catalog search values', () => {
    expect(
      referenceCatalogQuerySchema.safeParse({
        search: 'x'.repeat(151),
      }).success,
    ).toBe(false);
  });
});
