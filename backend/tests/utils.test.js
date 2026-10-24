import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import pagination from '../utils/pagination.js';
import formatZodError from '../utils/formatZodError.js';
import validateMongoId from '../utils/validateMongoId.js';

describe('Pagination helper', () => {
  it('should use default values for invalid inputs', () => {
    expect(pagination('invalid', 'invalid')).toEqual({
      page: 1,
      limit: 10,
      skip: 0,
    });
  });

  it('should calculate skip correctly', () => {
    expect(pagination('3', '20')).toEqual({
      page: 3,
      limit: 20,
      skip: 40,
    });
  });

  it('should limit maximum page size to 100', () => {
    expect(pagination('1', '500').limit).toBe(100);
  });
});

describe('Zod error formatter', () => {
  it('should return field names and readable messages', () => {
    const schema = z.object({
      name: z.string().min(1, 'Name is required'),
    });

    const result = schema.safeParse({ name: '' });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(formatZodError(result.error)).toEqual([
        {
          field: 'name',
          message: 'Name is required',
        },
      ]);
    }
  });
});

describe('MongoDB ID validator', () => {
  it('should reject invalid IDs with status code 400', () => {
    expect(() => validateMongoId('invalid-id')).toThrow('Invalid MongoDB ID');

    try {
      validateMongoId('invalid-id');
    } catch (error) {
      expect(error.statusCode).toBe(400);
    }
  });
});
